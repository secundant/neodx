# @neodx/libmake

Next generation libraries toolkit.
Build upon

## Features

- [ ] **MW** Zero configuration with auto detection
  - [ ] SWC additional configuration (`.swcrc`)
  - [ ] Babel (`.babelrc` or other formats) - we should replace swc with babel when we
  - [ ] CSS
    - [ ] PostCSS (by default if we found `postcss.config.js` or any other pre-processor)
    - [ ] SCSS (detect `node-sass`/`sass`)
- [ ] Beautiful TypeScript support
  - [ ] Builds clean TypeScript definitions
  - [ ] Support configuration: `baseUrl, paths, externalHelpers, target, sourceMap, experimentalDecorators`
- [ ] Multiple entries and outputs
  - [ ] Different outputs: `CJS`, `ESM` (.mjs), `UMD`
  - [ ] Single or multiple inputs: file, array, globs and all together

## Installation and fast setup

### Yarn

```shell
yarn add -D @neodx/libmake
```

### Npm

```shell
npm i -D @neodx/libmake
```

## Usage

### Zero-config way: Just describe "source" and dist files your package.json

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
    dev: 'libmake watch',
    build: 'libmake'
  }
}
```

### Example of package.json minimal setup

```json5
{
  main: 'dist/index.cjs',
  module: 'dist/index.mjs',
  scripts: {
    dev: 'libmake watch',
    build: 'libmake'
  }
}
```

### Optional configuration

Will be helpful for customization your flow.

```json5
// package.json
{
  // all configuration should be placed here
  library: {
    /**
     * See details about library types below
     * - standalone (default)
     * - transpile
     */
    type: 'transpile',
    // By default, minification works only on "build" command. Set it to "false" if you never want to minify
    minify: false,
    // Same as for "minify" - by default, it only works on "build" command. Set it to "false" for permanently disable
    sourceMap: false
  }
}
```

## Concepts

### Library types

- `standalone` - build all source to single file, single entry point -> single output.
  Useful for NodeJs-oriented/CLI, configs, regular small isolated libraries, etc.
- `transpile` (in development) - works exactly as "tsc" - transpiles files to destination.

## Roadmap

- [ ] Flexible build strategies
  - [x] `standalone` - build single source entry into single output entry
  - [ ] `public-api` - build multiple sources into multiple outputs.
        All shared code will be grouped as dynamic generated chunks (ex. `dist/esm/__internal/utils-a241s.mjs`)
  - [ ] `transpiled` - preserve sources structure, just transpile it to multiple targets
- [ ] Builtin features
  - [x] Support typescript paths
  - [x] Development mode
- [ ] Optional features
  - [ ] CSS - Auto detect PostCSS, sass
  - [ ] Babel - replace swc when .babelrc detected
  - [ ] SWC - extend configuration when .swcrc detected
  - [ ]
