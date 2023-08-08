# Working with multiple colors

Let's imagine that we have a really different icons with next requirements:

- We have some known list of the accent colors, and we want to specify them in our CSS
- All other colors should be inherited from the parent (for example, `currentColor`)

## Configure `resetColors` option

::: tip

In [previous guide](./colors-reset.md) we've explained `resetColors` option in details.

:::

```typescript
import svg from '@neodx/svg/vite';

svg({
  // ...
  resetColors: {
    // 1. Define known accent colors
    replace: {
      from: ['#6C707E', '#A8ADBD', '#818594'],
      to: 'var(--icon-accent-color)'
    },
    // 2. Replace all other colors with `currentColor`
    replaceUnknown: 'currentColor'
  }
});
```

## Add CSS variables

```css
/* shared/ui/index.css */

@layer base {
  :root {
    /* make default accent color */
    --icon-primary-color: #6c707e;
  }
}
```

## Usage

Dirty but works 🫢

Probably, you can find a better solution 🫠

```tsx
import { Icon } from '@/shared/ui';

export function SomeFeature() {
  return (
    <Icon
      name="common/add"
      className="text-red-800 [--icon-primary-color:theme(colors.green.800)]"
    />
  );
}
```

## Related

- ["Automatically reset colors" guide](./colors-reset.md)
- ["Writing Icon Component" guide](./writing-icon-component.md)
