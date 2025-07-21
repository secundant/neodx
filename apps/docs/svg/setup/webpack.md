# Setup `@neodx/svg` with [Webpack](https://webpack.js.org/)

## 1. Configure your assets

Add `@neodx/svg/webpack` plugin to `webpack.config.js` and describe your SVG assets location and output.

::: code-group

```javascript [webpack.config.js]
const svg = require('@neodx/svg/webpack');

module.exports = {
  plugins: [
    svg({
      inputRoot: 'src/shared/ui/icon/assets',
      output: 'public/sprites',
      fileName: '{name}.{hash:8}.svg',
      metadata: 'src/shared/ui/icon/sprite.gen.ts',
      group: true
    })
  ]
};
```

:::

## 2. Create your `Icon` component

Visit our [Writing `Icon` component](../writing-icon-component) guide to see detailed instructions for creating an `Icon` component.

A simple variant of the `Icon` component will look like this:

```tsx [icon.tsx]
import clsx from 'clsx';

export function Icon({ name, className, ...props }) {
  return (
    <svg
      className={clsx('select-none fill-current inline-block text-inherit box-content', className)}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use href={`/sprites/sprite.svg#${name}`} />
    </svg>
  );
}
```

## 3. Use your `Icon` component

```tsx [some-component.tsx]
import { Icon } from '@/shared/ui/icon';

export function SomeComponent() {
  return <Icon name="common:groups" />;
}
```

## Next steps

- Read about [Grouping icons](../group-and-hash.md) and [Generating metadata](../metadata.md)
- Learn about [Writing `Icon` component](../writing-icon-component) in detail
