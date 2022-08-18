# @my-org/svg-toolkit

Easy to use SVG sprites generator.

- Highly configurable
- Optimizing result files
- Providers plugin for generating types and information about sprites

## Installation

```shell
yarn add -D prettier @my-org/svg-toolkit@"workspace:*"
# prettier is optional, you can skip it
yarn add -D @my-org/svg-toolkit@"workspace:*"
```

## Usage

Put all your svg files to some folder and group them if it's necessary.

### Configuration

Create .spriterc.js (`.js` or some another other `rc` file format), we're using [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) under the hood

```javascript
const { typescriptPlugin } = require('@my-org/svg-toolkit');

/**
 * @type {import('@my-org/svg-toolkit').ConfigurationInput}
 */
module.exports = {
  // Root path to svg files
  inputRoot: 'source',
  output: {
    // root: '.',
    // fileName: '{name}.svg',
    // staticFiles: 'public'
  },
  plugins: [
    typescriptPlugin({
      target: 'sprite.meta.ts'
    })
  ],
  group: true
};
```

### Run build

```shell
yarn sprite build
```
