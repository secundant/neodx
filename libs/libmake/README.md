<h1 align="center">
  <a aria-label="SVG sprite" href="https://github.com/secundant/neodx/libs/svg-sprite">
    🛠️ libmake - Zero configuration libraries builder
  </a>
</h1>

> In early development

Built upon rollup and swc

## Features

- [ ] Zero configuration with auto detection
  - [x] SWC additional configuration (`.swcrc`)
  - [ ] Babel (`.babelrc` or other formats) - we should replace (or add one more step?) swc with babel when we found `.babelrc`
  - [x] CSS
    - [x] PostCSS (by default if we found `postcss.config.js` or any other pre-processor)
    - [x] SCSS, LESS, Stylus
    - [x] Modules (`???.module.css`) and global (any other) files
- [x] Beautiful TypeScript support
  - [x] Builds clean TypeScript definitions
  - [x] Support configuration: `baseUrl, paths, externalHelpers, target, sourceMap, experimentalDecorators`
- [x] Multiple entries and outputs
  - [x] Different outputs: `CJS`, `ESM` (.mjs), `UMD`
  - [x] Single or multiple inputs: file, array, globs and all together
  - [ ] Out-of-box split output on multiple entries
  - [ ] **wip** `package.json` update suggestion: `exports` and `typesVersions`

## Installation and fast setup

Install libmake with any package manager: `yarn add -D @neodx/libmake` / `npm i -D @neodx/libmake`.

Describe your package.json:

```json5
{
  main: 'dist/index.cjs',
  types: 'dist/index.d.ts',
  source: 'src/index.ts',
  module: 'dist/index.mjs',
  exports: {
    '.': {
      default: './dist/index.mjs',
      require: './dist/index.cjs',
      import: './dist/index.mjs'
    }
  },
  files: ['dist', 'README.md'],
  scripts: {
    dev: 'libmake -w',
    build: 'libmake'
  }
}
```

And try to run our CLI: `yarn libmake`

Example of package.json minimal setup

```json5
{
  main: 'dist/index.cjs',
  module: 'dist/index.mjs',
  scripts: {
    dev: 'libmake -w',
    build: 'libmake'
  }
}
```
