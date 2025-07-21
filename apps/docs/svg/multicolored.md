# Working with multiple colors

In most cases, your icons will have only one color, which is reset to `currentColor` for easy CSS control. However, sometimes you need icons with multiple colors—such as a primary and a secondary color, or special accents.

This guide shows how to use the `resetColors` option to enable multi-color support, and how to control those colors from your CSS or design system.

## Motivation

- You want to specify a known set of main colors in your CSS
- All other colors should be inherited from the parent (e.g., `currentColor`)
- You want to support themes, dark mode, or dynamic color changes

## Configure `resetColors` for multicolored icons

See the [color reset guide](./colors-reset.md) for a full explanation of the `resetColors` option.

Here's a typical configuration for multicolored icons:

```typescript
svg({
  resetColors: {
    // 1. Define known main colors to be reset to currentColor
    replace: ['#6C707E', '#A8ADBD', '#818594'],
    // 2. Replace all other colors with a CSS variable for secondary color
    replaceUnknown: 'var(--icon-secondary-color)'
  }
});
```

- All icons with the listed colors will use `currentColor` (inheriting from CSS)
- All other colors will use the CSS variable `--icon-secondary-color`

## Add CSS variables

To control the secondary color, add a CSS variable to your base styles:

```css
@layer base {
  :root {
    /** Multi-color icons will use this variable as an additional color */
    --icon-secondary-color: currentColor;
  }
}
```

## Usage in your app

You can set the secondary color using any CSS method:

### With CSS Modules

```css
.icon {
  color: theme('colors.red.600');
  --icon-secondary-color: theme('colors.green.600');
}
```

### With Tailwind CSS

You can use arbitrary values or create a plugin for convenience:

```tsx
<Icon name="my-icon" className="text-red-800 [--icon-secondary-color:theme(colors.green.600)]" />
```

Or, create a Tailwind plugin for `icon-secondary-*` utilities:

```js
const plugin = require('tailwindcss/plugin');

module.exports = {
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          'icon-secondary': value => ({
            '--icon-secondary-color': value
          })
        },
        { values: flatColors(theme('colors')) }
      );
    })
  ]
};

const flatColors = (colors, prefix = '') =>
  Object.entries(colors).reduce(
    (acc, [key, value]) =>
      Object.assign(
        acc,
        typeof value === 'object'
          ? flatColors(value, `${prefix}${key}-`)
          : { [`${prefix}${key}`]: value }
      ),
    {}
  );
```

Now you can use:

```tsx
<Icon name="common/add" className="icon-secondary-green-800 hover:icon-secondary-red-800" />
```

### With inline styles (not recommended)

```tsx
<Icon name="my-icon" style={{ '--icon-secondary-color': '#00ff00' }} />
```

## Best Practices

- Use `currentColor` for the main icon color
- Use CSS variables for secondary/tertiary colors
- Prefer CSS Modules or Tailwind plugins for maintainability
- Test your icons in different themes and color schemes
- See [Color Reset API Reference](./api/features/reset-colors.md) for advanced configuration

## Related

- [Automatically reset colors](./colors-reset.md)
- [Writing Icon Component](./writing-icon-component.md)
- [Color Reset API Reference](./api/features/reset-colors.md)
