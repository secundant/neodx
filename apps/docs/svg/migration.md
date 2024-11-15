# Migrations

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

## `v1.0.0`

## `v0.8.0`

The most featured release of `@neodx/svg` and the last one before the v1.0.0 release to maintain partial compatibility with the previous versions and provide a smooth migration path.

In this release we've redesigned the internals of the `@neodx/svg` library and made public API more stable and consistent.

All changes are backward compatible, but we recommend to update your code to the latest version.

- [`root` -> `inputRoot`](#root-option-was-renamed-to-inputroot)

### `root` option was renamed to `inputRoot`

The `root` option was renamed to `inputRoot` to make it clearer that it's a root path for the input files.

### `metadata` option was simplified, `definitions` and `experimentalRuntime` options were removed

The `metadata` option is now a string representing the metadata file path.

Previously, you could disable types or runtime values generation, but this was somewhat confusing.

### `vfsParams` and `logger` options was removed

::: note
Mostly for [Node API Usage](./api/index.md)
:::

Now only `vfs` and `log` options are supported.
Both of them are flexible and support multiple ways to provide them.
