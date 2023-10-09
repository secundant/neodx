# Group and hash sprites

## Missed features of SVG in JS

Despite the all disadvantages of SVG in JS, it has some design features:

- Bundlers will chunk icon components by their usage, so we'll have a lot of on-demand chunks instead of one big sprite.
- Components will be tree-shaken, so we'll have only used icons in the final bundle.
- As we're getting JS bundle, we're always seeing up-to-date icons

## Solving problems

To solve these problems at least partially, we're providing next features:

- Grouping icons into multiple sprites by directory name
- Adding hash to sprite file name to prevent caching issues
- [Generating metadata](./metadata.md) (width, height, viewBox, and sprite file path) for runtime usage

Imagine that we already have the following sprites in your output with regular configuration:

```diff
/
├── assets
│   ├── common
│   │   ├── left.svg
│   │   └── right.svg
│   └── actions
│       └── close.svg
├── public
+   └── sprites
+       ├── common.svg
+       └── actions.svg
```

But this is not very good for caching, because if you change any of the SVG files,
the sprite filename won't be updated, which could result in an infinite cache.

To solve this issue and achieve content-based hashes in filenames, you need to take three steps:

1. Provide the `fileName` option with a `hash` variable (e.g. `fileName: "{name}.{hash:8}.svg"`)
2. Configure the `metadata` option to get additional information about the file path by sprite name during runtime
3. Update your `Icon` component (or whatever you use) to support the new runtime information

::: code-group

```typescript {9,11} [vite.config.ts]
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      root: 'assets',
      output: 'public/sprites',
      // group icons by sprite name
      group: true,
      // add hash to sprite file name
      fileName: '{name}.{hash:8}.svg'
    })
  ]
});
```

:::

Now you will get the following output:

```diff
/
├── assets
│   ├── common
│   │   ├── left.svg
│   │   └── right.svg
│   └── actions
│       └── close.svg
├── public
+   └── sprites
+       ├── common.12ghS6Uj.svg
+       └── actions.1A34ks78.svg
```

In the result, we will solve the following problems:

- Now all icons are grouped into multiple sprites which will be loaded on-demand
- Sprite file names contain hash to prevent caching issues

But now we don't know actual file names in runtime! 🙀

Let's close this gap by learning about [metadata](./metadata.md) and [writing well-featured `Icon` component](./writing-icon-component.md)!
