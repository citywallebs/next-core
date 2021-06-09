const fs = require("fs-extra");
const path = require("path");

module.exports = function generateSnippets() {
  const distSnippetsPath = path.resolve("dist-snippets");
  if (!fs.existsSync(distSnippetsPath)) {
    return;
  }
  const { snippets } = require(distSnippetsPath);
  fs.writeJsonSync(path.resolve("dist/snippets.json"), snippets, {
    spaces: 2,
  });
};
