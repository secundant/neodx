# CLI

Currently, we don't recommend using CLI mode because it's not flexible enough and requires extra setup
if you want to use it - see [CLI](#cli) section and [CLI Options API](#cli-options).

```shell
yarn sprite --help
```

Let's run `sprite` with some additional options:

```bash
yarn sprite --group --root assets -o public/sprite -d src/shared/ui/icon/sprite.gen.ts --reset-unknown-colors
```

In details:

- The `--group` option group icons by folders (`common` and `other`)
- The `--root` option sets `assets` as a base path for icons (you can try to remove it and see the difference)
- The `-o` option sets `public/sprite` as a base path for generated sprites (it's default value, but let's keep it for now)
- The `-d` option generates TS definitions file with sprite meta information

## CLI

> **Warning:**
> While the CLI mode is currently available,
> it's not the recommended method of use and might be removed in future major versions.
>
> Now we're providing built-it bundlers integration, please, use [our plugin](#integrate-with-your-bundler) instead.

To get started, you can try the CLI mode even without any configuration, just run `sprite` command:

```shell
yarn sprite
```

This command searches for all SVG files, excluding those in the `public/sprites` folder and generate sprites in `public/sprites`.

By default, it creates a single sprite containing all icons without any grouping or TS definitions. However, this can be customized. See [CLI options](#cli-options) for more information

### CLI Options

| option                     | default                         | description                                                                                                                         |
| -------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `-i`, `--input`            | `"**/*.svg"`                    | Glob paths to icons files (output path will be automatically excluded)                                                              |
| `-o`, `--output`           | `"public/sprites"`              | Base path to generated sprite/sprites folder                                                                                        |
| `-d`, `--definitions`      | Not provided (**disabled**)     | Path to generated TS file with sprite meta                                                                                          |
| `--root`                   | `"."` (same as the current dir) | Base path to your assets, useful for correct groups names<br/>**careful:** `--input` should be relative to `--root`                 |
| `--group`                  | `false`                         | Should we group icons by folders?                                                                                                   |
| `--dry-run`                | `false`                         | Print proposal of generated file paths without actually generating it                                                               |
| `--optimize`               | `true`                          | Should we optimize SVG with [svgo](https://github.com/svg/svgo)?                                                                    |
| `--reset-color-values`     | `"#000,#000000"`                | An array of colors to replace as `currentColor`                                                                                     |
| `--reset-unknown-colors`   | `false`                         | Should we set `currentColor` for all colors not defined in `--reset-color-values`, or for all colors if this option isn't provided? |
| `--reset-color-properties` | `"fill,stroke"`                 | An array of SVG properties that will be replaced with `currentColor` if they're present                                             |

> **Note:** `--reset-color-values` and `--reset-color-properties` are strings with comma-separated values, don't forget to wrap them with quotes:
>
> `sprite ... --reset-color-values "#000,#000000,#fff"`
