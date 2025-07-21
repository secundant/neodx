# Migrations

## `v0.8.0`

The most featured release of `@neodx/svg` and the last one before the v1.0.0 release to maintain partial compatibility with the previous versions and provide a smooth migration path.

In this release we've redesigned the internals of the `@neodx/svg` library and made public API more stable and consistent.

- [CLI Deprecation](#cli-deprecation)
- [`root` -> `inputRoot`](#root-option-was-renamed-to-inputroot)
- [`metadata` simplification](#metadata-option-was-simplified-definitions-and-experimentalruntime-options-were-removed)

### CLI Deprecation

The CLI mode has been deprecated in favor of the programmatic API and will be removed in the v1.0.0 release.

#### Migration Steps

1. **Replace CLI Usage with Programmatic API**

   Instead of using the CLI command:

   ```bash
   yarn sprite --group --root assets -o public/sprite -d src/shared/ui/icon/sprite.gen.ts --reset-unknown-colors
   ```

   Use the programmatic API in your build script:

   <!--@include: ./shared/node-api-snippet.md-->

2. **Update Build Scripts**

   If you were using the CLI in your package.json scripts:

   ```json
   {
     "scripts": {
       "build:icons": "sprite --group --root assets"
     }
   }
   ```

   Create a new build script file (e.g., `scripts/build-icons.ts`):

   <!--@include: ./shared/node-api-snippet.md-->

   And update your package.json:

   ```json
   {
     "scripts": {
       "build:icons": "tsx scripts/build-icons.ts"
     }
   }
   ```

3. **Update CI/CD Pipelines**

   If you are using the CLI in your CI/CD pipelines, update them to use the programmatic API instead.

### `root` option was renamed to `inputRoot`

The `root` option was renamed to `inputRoot` to make it clearer that it's a root path for the input files.

### `metadata` option was simplified, `definitions` and `experimentalRuntime` options were removed

The `metadata` option is now a string representing the metadata file path.

Previously, you could disable types or runtime values generation, but this was somewhat confusing.

### `vfsParams` and `logger` options was removed

::: tip
Mostly for [Node API Usage](./api/index.md)
:::

Now only `vfs` and `log` options are supported.
Both of them are flexible and support multiple ways to provide them.
