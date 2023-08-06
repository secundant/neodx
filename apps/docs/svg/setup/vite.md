# Setup `@neodx/svg` with [Vite](https://vitejs.dev/)

::: tip Example repository
You can visit ["examples/svg-vite"](https://github.com/secundant/neodx/tree/main/examples/svg-vite) project in our repository to see how it works.
:::

## 1. Configure your assets

Add `@neodx/svg/vite` plugin to `vite.config.ts` and describe your svg assets location and output.

::: code-group

```typescript {3,8-11} [vite.config.ts]
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    react(),
    svg({
      // A "root" directory will be used to search for svg files
      root: 'assets/icons',
      output: 'public'
    })
  ]
});
```

:::

## 2. Create your `Icon` component

Visit our [Writing `Icon` component](../writing-icon-component) guide to see detailed instructions for creating `Icon` component.

The simplest variant of `Icon` component will look like this:

```tsx [icon.jsx]
import clsx from 'clsx';

export function Icon({ name, className, ...props }) {
  return (
    <svg
      className={clsx('select-none fill-current inline-block text-inherit box-content', className)}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use href={`/sprite.svg#${name}`} />
    </svg>
  );
}
```

## 3. Use your `Icon` component

```tsx [some-component.tsx]
import { Icon } from '@/shared/ui/icon';

export function SomeComponent() {
  return <Icon name="my-icon-name" />;
}
```

## Next steps

- Read about [Grouping icons](../group-and-hash.md) and [Generating metadata](../metadata.md)
- Learn about [Writing `Icon` component](../writing-icon-component) in detail
