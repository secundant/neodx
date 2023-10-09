# `resetColors` plugin

`resetColors` plugin allows applying complex color replacement logic to building SVG sprites.

## `ResetColorsPluginParams`

::: tip
We're using [colord](https://github.com/omgovich/colord) to parse colors, so you can pass any color format supported by it.
:::

```typescript
import { type AnyColor, type Colord } from 'colord';

// You can pass single config object or array of them
export type ResetColorsPluginParams =
  | ColorPropertyReplacementInput
  | ColorPropertyReplacementInput[];

interface ColorPropertyReplacementInput {
  // SVG props to replace colors in (default: 'fill', 'stroke')
  properties?: string | string[];
  // Colors to keep untouched
  keep?: AnyColorInput | AnyColorInput[];
  // Included files filter. If not specified, all files will be included
  include?: FileFilterInput;
  // Excluded files filter. If not specified, no files will be excluded
  exclude?: FileFilterInput;
  /**
   * Manual color replacement config
   * @example { from: 'red', to: 'currentColor' }
   * @example { from: ['red', 'green'], to: 'var(--icon-primary-color)' }
   * @example 'red' // equals to { from: 'red', to: 'currentColor' }
   * @default [] // no manual replacement
   */
  replace?: ColorReplacementInput | ColorReplacementInput[];
  /**
   * Color (or any token) to replace unknown colors with
   * @example 'currentColor'
   * @example 'var(--icon-primary-color)'
   */
  replaceUnknown?: string;
}

export type AnyColorInput = AnyColor | Colord;
export type FileFilterInput = FileFilterInputValue | FileFilterInputValue[];
export type FileFilterInputValue = string | RegExp;
export type ColorReplacementInput = string | ColorReplacementInputConfig;

export interface ColorReplacementInputConfig {
  from: AnyColorInput | AnyColorInput[];
  to?: string;
}
```
