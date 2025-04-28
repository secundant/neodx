# CLI

::: danger
The CLI mode is deprecated and will be removed in v1.0.0. Please migrate to the programmatic API.
:::

> **Warning:**
> The CLI mode is deprecated and will be removed in v1.0.0. We recommend migrating to the programmatic API for better flexibility, type safety, and integration capabilities.
>
> See [Migration Guide](./migration.md#cli-deprecation) for detailed migration steps.

## Migration to Programmatic API

We strongly recommend migrating to the programmatic API. Here's a quick example of how to achieve the same functionality:

```typescript
import { createSvgSpriteBuilder } from '@neodx/svg';

const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprite',
  metadata: 'src/shared/ui/icon/sprite.gen.ts',
  group: true,
  resetColors: {
    replaceUnknown: 'currentColor'
  }
});

await builder.load('**/*.svg');
await builder.build();
```

For more details and migration steps, please refer to the [Migration Guide](./migration.md#cli-deprecation).

## Deprecated CLI Usage

::: warning
The following sections are deprecated and will be removed in v1.0.0.
:::

### Basic Usage

```shell
yarn sprite --help
```

Example usage:

```bash
yarn sprite --group --root assets -o public/sprite -d src/shared/ui/icon/sprite.gen.ts --reset-unknown-colors
```

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
