# Setup `@neodx/svg` with [Webpack](https://webpack.js.org/)

## 1. Configure your assets

Add `@neodx/svg/webpack` plugin to `webpack.config.js` and describe your svg assets location and output.

::: code-group

```javascript [webpack.config.js]
const svg = require('@neodx/svg/webpack');

module.exports = {
  plugins: [
    svg({
      root: 'assets',
      output: 'public'
    })
  ]
};
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
