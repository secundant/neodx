<h1 align="center">
  <a aria-label="SVG sprite" href="https://github.com/secundant/neodx/libs/svg-sprite">
    🗃@neodx/svg-sprite - SVG sprites generator
  </a>
</h1>
<p align="center">
  Flexible SVG sprites generator
</p>

- Optimizes output with svgo
- Creates TypeScript`s interface with generated sprites info
- Creates meta information about sprites
- Provides plugins system for specific extensions

## Installation

- Yarn: `yarn add -D @neodx/svg-sprite`
- NPM: `npm i -D @neodx/svg-sprite`

## Getting started

```shell
# Run our CLI when configuration is ready
yarn sprite build
```

We use [lilconfig](https://github.com/davidtheclark/lilconfig) under the hood,
you need create `.spriterc.js`:

```javascript
/**
 * Example of minimal configuration
 * @type {import('libs/svg').Configuration}
 */
module.exports = {
  input: 'assets/svg/*.svg',
  outputRoot: 'public'
};
```

## Advanced configuration

```javascript
const { plugins } = require('libs/svg');

/**
 * @type {import('libs/svg').Configuration}
 */
module.exports = {
  /**
   * Input can also be an array and take base url in "inputRoot" option.
   * In this example we will scan all files in [assets/static/..., assets/tmp/...]
   */
  input: ['static/**/*.svg', 'tmp/*.svg'],
  inputRoot: 'assets',
  /**
   * You can set multiple outputs
   */
  outputRoot: ['public/sprites', '.build/assets/sprites'],
  /**
   * {name} will be replaced with sprite name ("sprite" by default)
   */
  fileName: '{name}.svg',
  /**
   * Override plugins. By default enabled svgo, setId and resetColors
   */
  plugins: [
    // Enable default plugins
    plugins.svgo(),
    plugins.setId(),
    plugins.resetColors(),
    /**
     * Plugin for grouping inputs to multiple sprites, will be useful for large icon sets.
     * Group inputs by relative directory name by default
     * @example Look at files structure below:
     * - actions/
     * - - add.svg
     * - - close.svg
     * - - subfolder/
     * - - - submit.svg
     * - alerts/
     * - - info.svg
     * - hello.svg
     * This will group sprites as {
     *   actions: ['add', 'close'],
     *   'actions/subfolder': ['submit'],
     *   alerts: ['info'],
     *   __root: ['hello']
     * }
     */
    plugins.group({
      defaultName: '__root'
    }),
    /**
     * This plugin will generate "shared/types/sprite.ts" with:
     * - export interface SpriteMap { modals: 'add' | 'close'; ... }
     * - export const spriteMap = { modals: ['add', 'close'] }
     */
    plugins.typescript({
      output: 'shared/types/sprite.ts',
      metaName: 'spriteMap',
      typeName: 'SpriteMap'
    })
  ]
};
```
