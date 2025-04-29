# Setup `@neodx/svg` with [Storybook](https://storybook.js.org/)

You can use `@neodx/svg` with Storybook by following the same setup as for your main project. Just ensure your Storybook build process includes the generated sprites and metadata.

- Follow the [Vite](./vite.md), [Webpack](./webpack.md), or [Other bundlers](./other.md) setup guides depending on your Storybook configuration.
- Import and use your `Icon` component in your stories as you would in your app.

Example:

```tsx
import { Icon } from '@/shared/ui/icon';

export default {
  title: 'Shared/Icon',
  component: Icon
};

export const Default = () => <Icon name="common:groups" />;
```
