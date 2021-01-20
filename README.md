# Brick Demo

[![pipeline status](https://github.com/easyops-cn/next-core/badges/master/pipeline.svg)](https://github.com/easyops-cn/next-core/commits/master)
[![coverage report](https://github.com/easyops-cn/next-core/badges/master/coverage.svg)](https://github.com/easyops-cn/next-core/commits/master)

## Contributing

[Contribution Guide](CONTRIBUTING.md)

### Prepare

`yarn`

### Development

`yarn start`

> `yarn start` equals `lerna run start --scope=@next-core/brick-container`.

`lerna run start --scope=OTHER-PACKAGES`

The dev server will use this repository's sibling director of _next-basics_ by default. It means it will work if your projects are like:

```
/Users/one/easyops/next-core
/Users/one/easyops/next-basics
```

In case the _next-basics_ located in other place, you could add a `dev.config.js` in this repository, E.g.:

```js
const path = require("path");
exports.nextRepoDir = path.join(__dirname, "../next-basics");
```

### Build

`yarn build`

### Test

`yarn test`

To test a specified file:

```shell
yarn test ./path/to/your.spec.ts
```

[@next-core/brick-dll]: packages/brick-dll
