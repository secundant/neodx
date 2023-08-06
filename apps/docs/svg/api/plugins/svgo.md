# `svgo` plugin

Optimize svg files using [svgo](https://github.com/svg/svgo).

## `SvgoPluginParams`

```typescript
import { type Config } from 'svgo';

export interface SvgoPluginParams {
  /**
   * Additional attributes to remove
   * By default we remove next attributes:
   * - '(class|style)',
   * - 'xlink:href',
   * - 'aria-labelledby',
   * - 'aria-describedby',
   * - 'xmlns:xlink',
   * - 'data-name'
   */
  removeAttrs: string[];
  /**
   * Override default svgo config
   */
  config?: Config;
}
```
