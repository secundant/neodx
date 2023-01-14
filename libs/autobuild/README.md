<h1 align="center">
  <a aria-label="Autobuild" href="https://github.com/secundant/neodx/libs/autobuild">
    🛠️ autobuild - Zero configuration libraries builder
  </a>
</h1>

> In early development

One command, one dependency and zero configuration to build your libraries.

Built upon [Rollup](https://github.com/rollup/rollup) and [SWC](https://swc.rs/).

## Features

- [ ] Zero configuration with auto detection
  - [x] SWC additional configuration (`.swcrc`)
  - [ ] Babel (`.babelrc` or other formats) - we should replace (or add one more step?) swc with babel when we found `.babelrc`
  - [x] CSS
    - [x] PostCSS (by default if we found `postcss.config.js` or any other pre-processor)
    - [x] SCSS, LESS, Stylus
    - [x] Modules (`my-file.module.css`) and global (any other) files
- [x] Beautiful TypeScript support
  - [x] Builds clean TypeScript definitions
  - [x] Support configuration: `baseUrl, paths, externalHelpers, target, sourceMap, experimentalDecorators`
- [x] Multiple entries and outputs
  - [x] Different outputs: `CJS`, `ESM` (.mjs), `UMD`
  - [x] Single or multiple inputs: file, array, globs and all together
  - [ ] Out-of-box split output on multiple entries
  - [ ] **wip** `package.json` update suggestion: `exports` and `typesVersions`

## Installation and fast setup

Install autobuild with any package manager: `yarn add -D @neodx/autobuild` / `npm i -D @neodx/autobuild`.

Describe your package.json:

```json5
{
  files: ['dist', 'README.md'],
  scripts: {
    build: 'autobuild src/index.ts'
  }
}
```

And try to run our CLI: `yarn autobuild`

## Known issues and limitations

### Slow TypeScript definitions and CSS build time

We use `rollup-plugin-dts` and `rollup-plugin-postcss`,
both of them significant slow down the build time.

Probably, we will change our setup with other solutions or even with self-made plugins in future.

### Limited CSS support - single file only, no imports in generated code

Unfortunately, currently we can't provide great CSS output :(

Supported features:

- CSS modules (`my-file.module.css`), global styles
- Scss, less, stylus
- PostCSS configuration
- Minification

Unsupported:

- Multiple entries - [see our "advanced-mixed" example](./examples/advanced-mixed)
- Import statements in built code, which is required for DX with multiple entries

## Temporal milestones

- [x] `[rejected]` Replace postcss plugin with https://www.npmjs.com/package/rollup-plugin-styles
- [ ] Add support for CSS splitting
- [ ] Research why swc remove `.scss` extension
- [ ] Fork `rollup-plugin-styles`
