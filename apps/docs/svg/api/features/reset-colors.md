# Color Reset

The color reset feature allows you to modify or reset colors in SVG files, which is particularly useful for creating icon sets with consistent color schemes or for implementing dynamic color changes.

## Usage

The feature is automatically enabled in the builder and can be configured through the `resetColors` option:

```typescript
svg({
  resetColors: {
    // Don't touch our special static colors
    keep: Object.values(colors.static),
    // Replace all brand colors with CSS variables
    replace: [
      { from: colors.brand.main, to: 'var(--color-brand-main)' },
      { from: colors.brand.secondary, to: 'var(--color-brand-secondary)' }
    ],
    // Replace all other colors with currentColor
    replaceUnknown: 'currentColor',
    // Preserve specific SVG files untouched
    exclude: /.*\.standalone\.svg$/
  }
});
```

## Configuration

```typescript
interface ColorPropertyReplacementInput {
  /**
   * Properties to replace colors in
   * @default ['fill', 'stroke']
   */
  properties?: string | string[];
  /**
   * Colors to keep untouched
   * @default []
   * @example ['#fff', '#000']
   */
  keep?: AnyColorInput | AnyColorInput[];
  /**
   * Define it if you want to include only certain files
   * @example /.*\.icon\.svg$/ // include only icons
   */
  include?: FileFilterInput;
  /**
   * Define it if you want to exclude certain files
   * @example /.*\.illustration\.svg$/ // exclude illustrations
   */
  exclude?: FileFilterInput;
  /**
   * Replace colors policy. You can define it in multiple ways:
   * - { from: <color>, [...<color>], to: <color> } will replace all colors from the `from` array with the `to` value
   * - `to` property is optional and will be replaced with the "replaceUnknown" option value if not defined
   * - raw color string ot array (e.g. '#fff' or ['#fff', '#000']) is alias for `{ from: <color>, [...<color>] }`
   *
   * @example Replace "#fff" with "currentColor"
   * { replace: '#fff' }
   * @example Replace "#fff" and "#000" with "currentColor"
   * { replace: ['#fff', '#000'] }
   * @example Replace "#fff" with "#000"
   * { replace: { from: '#fff', to: '#000' } }
   * @example Replace "#fff" and "#000" with "currentColor"
   * { replace: { from: ['#fff', '#000'], to: 'currentColor' } }
   * @example Replace "#fff" and "#000" with "currentColor" and "#eee" with "#e5e5e5"
   * { replace: ['#fff', '#000', { from: '#eee', to: '#e5e5e5' }], replaceUnknown: 'currentColor' }
   */
  replace?: ColorReplacementInput | ColorReplacementInput[];
  /**
   * Color to replace unknown (not defined implicitly in "replace.to" option) colors
   * @default 'currentColor'
   */
  replaceUnknown?: string;
}

type AnyColorInput = AnyColor | Colord;
type FileFilterInput = FileFilterInputValue | FileFilterInputValue[];
type FileFilterInputValue = string | RegExp;
type ColorReplacementInput = string | ColorReplacementInputConfig;

interface ColorReplacementInputConfig {
  from: AnyColorInput | AnyColorInput[];
  to?: string;
}
```

The `resetColors` option accepts the following values:

- `true` - converts all colors to `currentColor`
- `false` - keeps original colors
- `ColorPropertyReplacementInput` - custom configuration

## Examples

### Basic Usage

```typescript
svg({
  resetColors: true
});
```

### Disable Color Reset

```typescript
svg({
  resetColors: false
});
```

### Custom Color Replacement

```typescript
svg({
  resetColors: {
    // Keep specific colors untouched
    keep: ['#fff', '#000'],
    // Replace brand colors with CSS variables
    replace: [
      { from: '#ff0000', to: 'var(--color-primary)' },
      { from: '#00ff00', to: 'var(--color-secondary)' }
    ],
    // Replace all other colors with currentColor
    replaceUnknown: 'currentColor',
    // Only process icon files
    include: /.*\.icon\.svg$/,
    // Don't process standalone files
    exclude: /.*\.standalone\.svg$/
  }
});
```

### Using CSS Variables

```typescript
svg({
  resetColors: {
    // Replace black with primary color, white with background
    replace: [
      { from: '#000000', to: 'var(--color-primary, currentColor)' },
      { from: '#ffffff', to: 'var(--color-bg, white)' }
    ],
    // Replace all other colors with currentColor
    replaceUnknown: 'currentColor'
  }
});
```

## Best Practices

1. Use `currentColor` for primary icon colors to inherit from parent elements
2. Use CSS variables for secondary colors to maintain consistency
3. Consider using a color palette system for complex icon sets
4. Test color replacements in different contexts (light/dark mode, hover states, etc.)
