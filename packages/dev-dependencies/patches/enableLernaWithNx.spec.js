const tree = {
  "/tmp/bricks": [
    {
      name: ".tmp",
      isDirectory: () => false,
    },
    {
      name: "bricks-a",
      isDirectory: () => true,
    },
  ],
  "/tmp/templates": [
    {
      name: ".tmp",
      isDirectory: () => false,
    },
    {
      name: "templates-b",
      isDirectory: () => true,
    },
  ],
};

const jsonMap = {
  "/tmp/lerna.json": {
    useWorkspaces: true,
  },
  "/tmp/package.json": {
    name: "my-bricks",
    scripts: {
      build: "tsc",
      test: "jest",
      "test:ci": "jest --ci",
    },
  },
};

const mockExistsSync = jest.fn((dir) => !!tree[dir]);
const mockReaddirSync = jest.fn((dir) => {
  if (tree[dir]) {
    return tree[dir];
  }
  throw new Error(`File not found: ${dir}`);
});
const mockReadJsonSync = jest.fn((filePath) => {
  if (jsonMap[filePath]) {
    return jsonMap[filePath];
  }
  throw new Error(`File not found: ${filePath}`);
});
const mockWriteJsonSync = jest.fn();
const mockOutputFileSync = jest.fn();
const mockAppendFileSync = jest.fn();
const mockRemoveSync = jest.fn();

jest.mock("fs-extra", () => ({
  existsSync: mockExistsSync,
  readdirSync: mockReaddirSync,
  readJsonSync: mockReadJsonSync,
  writeJsonSync: mockWriteJsonSync,
  outputFileSync: mockOutputFileSync,
  appendFileSync: mockAppendFileSync,
  removeSync: mockRemoveSync,
}));

jest.mock("path", () => ({
  resolve: (dir) => `/tmp/${dir}`,
  join: (...paths) => paths.join("/"),
}));

const enableLernaWithNx = require("./enableLernaWithNx");

describe("enableLernaWithNx", () => {
  it("should work", () => {
    enableLernaWithNx();
    expect(mockWriteJsonSync).toHaveBeenCalledTimes(3);
    expect(mockOutputFileSync).toHaveBeenCalledTimes(2);

    expect(mockWriteJsonSync).toHaveBeenNthCalledWith(
      1,
      "/tmp/nx.json",
      expect.objectContaining({
        tasksRunnerOptions: expect.anything(),
      }),
      { spaces: 2 }
    );
    expect(mockWriteJsonSync).toHaveBeenNthCalledWith(
      2,
      "/tmp/lerna.json",
      {
        useWorkspaces: true,
        useNx: true,
      },
      { spaces: 2 }
    );
    expect(mockWriteJsonSync).toHaveBeenNthCalledWith(
      3,
      "/tmp/package.json",
      {
        name: "my-bricks",
        scripts: {
          build: "tsc",
          test: "next-jest",
          "test:ci": "lerna run test:ci --",
        },
      },
      { spaces: 2 }
    );

    expect(mockOutputFileSync).toHaveBeenNthCalledWith(
      1,
      "/tmp/bricks/bricks-a/jest.config.js",
      `const { jestConfigFactory } = require("@next-core/jest-config-factory");

module.exports = jestConfigFactory({
  standalone: true,
  cwd: __dirname,
});
`
    );

    expect(mockAppendFileSync).toBeCalledWith("/tmp/.gitignore", "\n.cache");
    expect(mockRemoveSync).toBeCalledWith("/tmp/jest.config.js");
  });
});
