# Working with multiple colors

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

::: info
In this guide, we'll use React, TypeScript, and Tailwind CSS, but you can use any other technologies.
:::

In most cases, our icons will have only one color, which will be reset to `currentColor`.

However, sometimes we need to specify multiple colors in our CSS. For example, our requirements could be:

- We have a known list of the main colors, and we want to specify them in our CSS.
- All other colors should be inherited from the parent (for example, `currentColor`).

## Configure `resetColors` option

::: tip
In the [color reset guide](./colors-reset.md), we explained the `resetColors` option in detail.
:::

Let's cover our described requirements with the following `resetColors` configuration:

```typescript
svg({
  // ...
  resetColors: {
    // 1. Define known main colors to be reset to currentColor
    replace: ['#6C707E', '#A8ADBD', '#818594'],
    // 2. Replace all other colors with CSS variable
    replaceUnknown: 'var(--icon-secondary-color)'
  }
});
```

## Add CSS variables

To control the secondary color, we need to add a CSS variable to our base styles:

```css
/* shared/ui/index.css */

@layer base {
  :root {
    /** Multi-color icons will use this variable as an additional color */
    --icon-secondary-color: currentColor;
  }
}
```

## Usage with CSS modules

Here's how you can use the icon with this setup:

::: code-group

```css some-feature.module.css
.icon {
  color: theme('colors.red.600');
  --icon-secondary-color: theme('colors.green.600');

  &:hover {
    color: theme('colors.red.900');
    --icon-secondary-color: theme('colors.green.900');
  }
}
```

```tsx some-feature.tsx
import { Icon } from '@/shared/ui';
import styles from './some-feature.module.css';

export function SomeFeature() {
  return <Icon name="common/add" className={styles.icon} />;
}
```

But it's an inconsistent and verbose way to work with colors in Tailwind, so let's try to make it proper.

:::

## Tailwind plugin {#tailwind-plugin}

If you're using [Tailwind CSS](https://tailwindcss.com/), you can meet the lack of convenient way to define secondary colors by the CSS variable.

::: details Straightforward approaches

### 🫠 CSS Modules

As we mentioned before, you can use CSS modules:

```css
.icon {
  color: theme('colors.red.600');
  --icon-secondary-color: theme('colors.green.600');
}
```

It's the cleanest, but a verbose and inconsistent way.

### 🫨 Arbitrary class

Tailwind enables you to define custom classes with access to your theme
While it may be slightly more concise for simple cases, it can be messier and less scalable than CSS modules.

```tsx
<Icon name="my-icon" className="text-red-800 [--icon-secondary-color:theme(colors.green.600)]" />
```

### ☠️ Inline styles

This approach is the least recommended: it lacks integration with the theme, does not utilize design tokens, and relies solely on hardcoded values.

While it is technically feasible, it is not an ideal solution for maintaining consistency and scalability in your design.

```tsx
<Icon name="my-icon" className="text-red-800" style={{ '--icon-secondary-color': '#00ff00' }} />
```

:::

To make working with secondary colors more convenient, you can create a Tailwind plugin that sets the CSS variable for you.

Here's a simple implementation:

```js
const plugin = require('tailwindcss/plugin');

module.exports = {
  // ...
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        {
          // set the css variable with the value of the color
          'icon-secondary': value => ({
            '--icon-secondary-color': value
          })
        },
        // all possible values are all colors from the theme
        { values: flatColors(theme('colors')) }
      );
    })
  ]
};

/**
 * Tailwind's colors are nested ({ red: { 50: '...', ... } }), so we need to flatten them
 * @example
 */
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

Now we can use `icon-secondary-...` utility classes to set the secondary color of our icons in the same way as we do with the regular colors:

```tsx
function SomeComponent() {
  return (
    <Icon name="common/add" className="icon-secondary-green-800 hover:icon-secondary-red-800" />
  );
}
```

## Related

- ["Automatically reset colors" guide](./colors-reset.md)
- ["Writing Icon Component" guide](./writing-icon-component.md)
