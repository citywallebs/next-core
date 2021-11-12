const path = require("path");
const fs = require("fs");
const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { throttle, escapeRegExp } = require("lodash");
const chokidar = require("chokidar");
const chalk = require("chalk");
const WebSocket = require("ws");
const getEnv = require("./getEnv");
const serveLocal = require("./serveLocal");
const getProxies = require("./getProxies");
const { getPatternsToWatch, appendLiveReloadScript } = require("./utils");

const env = getEnv();

const app = express();

const distDir = path.dirname(
  require.resolve(
    `@next-core/brick-container/${
      env.standaloneMicroApps ? "dist-standalone" : "dist"
    }/index.html`
  )
);

const port = env.port;

serveLocal(env, app);

let cachedIndexHtml;

const serveIndexHtml = (_req, res) => {
  if (!cachedIndexHtml) {
    const indexHtml = path.join(distDir, "index.html");
    let content = fs.readFileSync(indexHtml, "utf8");

    if (env.liveReload) {
      content = appendLiveReloadScript(content, env);
    }

    content = content.replace(
      new RegExp(
        escapeRegExp("<!--# echo var='base_href' default='/' -->"),
        "g"
      ),
      env.baseHref
    );

    if (env.standaloneMicroApps) {
      content = content
        .replace(
          new RegExp(escapeRegExp("<!--# echo var='app_dir' -->"), "g"),
          env.standaloneAppDir
        )
        .replace(
          "</head>",
          [
            "<script>",
            "((w)=>{",
            [
              `var t=${JSON.stringify(env.standaloneAppDir)}`,
              "w.STANDALONE_MICRO_APPS=true",
              `var p=w.PUBLIC_ROOT=t+"-/"`,
              'w.CORE_ROOT=p+"core/"',
              `w.BOOTSTRAP_FILE=p+"bootstrap.hash.json"`,
            ]
              .filter(Boolean)
              .join(";"),
            "})(window)",
            "</script></head>",
          ].join("")
        );
    }

    cachedIndexHtml = content;
  }

  // Replace nginx ssi placeholders.
  res.send(cachedIndexHtml);
};

if (env.useLocalContainer) {
  const serveRoot = env.standaloneMicroApps
    ? `${env.baseHref}${env.standaloneAppDir}`
    : env.baseHref;
  // Serve index.html.
  app.get(serveRoot, serveIndexHtml);
  // Serve static files.
  app.use(serveRoot, express.static(distDir));
}

// Using proxies.
const proxies = getProxies(env);
if (proxies) {
  for (const [path, options] of Object.entries(proxies)) {
    app.use(
      path,
      createProxyMiddleware(
        Object.assign(
          {
            logLevel: "warn",
          },
          options
        )
      )
    );
  }

  if (env.useSubdir) {
    app.all(
      /^(?!\/next\/).+/,
      createProxyMiddleware({
        target: env.consoleServer,
        secure: false,
        changeOrigin: true,
        logLevel: "warn",
      })
    );
  }
}

if (env.useLocalContainer) {
  // All requests fallback to index.html.
  app.use(serveIndexHtml);
}

app.listen(port, env.host);

console.log(
  chalk.bold.green("Started serving at:"),
  `http://${env.host}:${port}${env.baseHref}`
);

// 建立 websocket 连接支持自动刷新
if (env.liveReload) {
  const wss = new WebSocket.Server({ port: env.wsPort });

  const watcher = chokidar.watch(getPatternsToWatch(env));

  const throttledOnChange = throttle(
    () => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send("content change");
        }
      });
    },
    100,
    { trailing: false }
  );

  watcher.on("change", throttledOnChange);
}
