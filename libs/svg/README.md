# @neodx/svg

Supercharge your icons ⚡️

## Motivation

Sprites are the most effective way to work with your SVG icons,
but for some reason developers (vision from react world) prefer
mostly bloated and ineffective - "compile" SVG to react component with inlined SVG content.

Of course, we can use some external tools like https://svgsprit.es/ or some npm libraries,
but that's not serious (if you know any alternatives - let me know, and I'll add links), developers need DX.

In a ridiculous, but incredibly popular way, we don't have other solutions with the same DX.

Just think about it a little, you need to "compile" SVG, to embed your secondary static content in JSX
and get a lot of unwanted issues: additional source code, extra build time, extra bundle size,
the user's browser will parse and evaluate your **static SVG** as JS code,
you can never cache it, WOOF, etc., etc.

And yes, developers keep using this insanity because even an incredibly inefficient solution with a good DX
is better than a super-efficient, but unusable setup with semi-manual generators.

That's why we're here! 🥳

- TypeScript support out of box - generated types and information about your sprites
- Built-in plugins for all major bundlers: `vite`, `webpack`, `rollup`, `esbuild`, etc.
- Optional grouping by folders
- Optimization with svgo
- Flexible colors reset
- Powerful files selection

## Installation and usage

```shell
# npm
npm install -D @neodx/svg
# yarn
yarn add -D @neodx/svg
# pnpm
pnpm add -D @neodx/svg
```

### CLI Mode

> **Warning:**
> While the CLI mode is currently available, it's not the recommended method of use and might be removed in future major versions.
>
> Now we're providing built-it bundlers integration, please, use [our plugin](#plugins) instead.

To get started, you can try the CLI mode even without any configuration, just run `sprite` command:

```shell
yarn sprite
```

This command searches for all SVG files, excluding those in the `public/sprites` folder and generate sprites in `public/sprites`.

By default, it creates a single sprite containing all icons without any grouping or TS definitions. However, this can be customized. See [CLI options](#cli-options) for more information

### Plugins

Our plugins provide a consistent interface and working principle across all major bundlers.

For instance, here's an example of `vite` plugin with some options:

```typescript
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      root: 'assets',
      group: true,
      output: 'public',
      definitions: 'src/shared/ui/icon/sprite.h.ts',
      resetColors: {
        replaceUnknown: 'currentColor'
      }
    })
  ]
});
```

It will search for all SVG files in `assets` folder, group them by folders, optimize them with `svgo`,
reset all colors to `currentColor` and generate sprites in `public` folder with TS definitions in `src/shared/ui/icon/sprite.h.ts`.

For more details see our [Step-by-step guide](#step-by-step).

Another plugins:

<details>
  <summary>Webpack</summary>

```typescript
import svg from '@neodx/svg/webpack';

export default {
  plugins: [
    svg({
      root: 'assets',
      output: 'public',
      definition: 'src/shared/ui/icon/sprite.h.ts'
    })
  ]
};
```

</details>

<details>
  <summary>Rollup</summary>

```typescript
import svg from '@neodx/svg/rollup';

export default {
  plugins: [
    svg({
      root: 'assets',
      output: 'public',
      definition: 'src/shared/ui/icon/sprite.h.ts'
    })
  ]
};
```

</details>

<details>
  <summary>ESBuild</summary>

```typescript
import svg from '@neodx/svg/esbuild';

export default {
  plugins: [
    svg({
      root: 'assets',
      output: 'public',
      definition: 'src/shared/ui/icon/sprite.h.ts'
    })
  ]
};
```

</details>

## Step-by-step

Our example stack details:

- `vite`
- `react`
- `typescript`
- `tailwindcss`

We'll be working with the following icons in our project:

```diff
assets/
  common/
    add.svg
    close.svg
  other/
    cut.svg
    search.svg
```

We want to generate separate sprites for each folder and use them in our React components.

### Build icons

Firstly, we adopt configuration from [Plugins](#plugins) section:

```typescript
import svg from '@neodx/svg/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    svg({
      root: 'assets',
      group: true,
      output: 'public',
      definitions: 'src/shared/ui/icon/sprite.h.ts',
      resetColors: {
        replaceUnknown: 'currentColor'
      }
    })
  ]
});
```

<details>
  <summary>If you decided to use CLI mode:</summary>

Let's run `sprite` with some additional options:

```bash
yarn sprite --group --root assets -o public/sprite -d src/shared/ui/icon/sprite.h.ts --reset-unknown-colors
```

In details:

- The `--group` option group icons by folders (`common` and `other`)
- The `--root` option sets `assets` as a base path for icons (you can try to remove it and see the difference)
- The `-o` option sets `public/sprite` as a base path for generated sprites (it's default value, but let's keep it for now)
- The `-d` option generates TS definitions file with sprite meta information

</details>

Now let's run `vite` (or `vite build`) and see what we have:

```diff
...
shared/
  ui/
    icon/
+      sprite.h.ts
public/
+  sprite/
+    common.svg
+    other.svg
```

For each folder in `assets`, a separate sprite is created, along with a TS definitions file containing metadata about all icons.

### Look at generated TS definitions

```ts
export interface SpritesMap {
  common: 'close' | 'favourite';
  format: 'align-left' | 'tag';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  common: ['close', 'favourite'],
  format: ['align-left', 'tag']
};
```

As you can see, we have a map of all sprites and meta information about them.

Now we can use it in our code - for type checking, autocomplete and other cool stuff.

### Create your Icon component

> It's a **simple** implementation, you can see a more real one in the "Recipes" section

```tsx
// shared/ui/icon/icon.tsx
import { SpritesMap } from './sprite-definitions';

export interface IconProps<Group extends keyof SpritesMap> {
  name: SpritesMap[Group];
  type?: Group;
}

export function Icon<Group extends keyof SpritesMap = 'common'>({ type, name }: IconProps<Group>) {
  return (
    <svg className="icon">
      <use xlinkHref={`/public/sprite/${type}.svg#${name}`}></use>
    </svg>
  );
}
```

### Enjoy 👏

```tsx
import { Icon, TextField } from '@/shared/ui';

export function SomeFeature() {
  return (
    <div className="space-y-4">
      <TextField name="a" startNode={<Icon name="add" />} />
      <TextField name="b" startNode={<Icon name="close" />} />
      <TextField name="c" startNode={<Icon type="other" name="search" />} />
    </div>
  );
}
```

## Recipes

### Building Icon component with TailwindCSS ([see example](./examples/react))

#### Add base `icon` class

```css
/* shared/ui/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  /*
    Our base class for all icons, includes:
    - `fill-current` - fill icon with current text color, so we can use `color` to change it
    - `w-[1em] h-[1em]` - set icon size to 1em, so we can use `font-size` to scale it
    - `box-content` - it's up to you, I choose it to keep icon size fixed
   */
  .icon {
    @apply select-none fill-current w-[1em] h-[1em] inline-block text-inherit box-content;
  }
}
```

#### Add `Icon` component

```tsx
// shared/ui/icon/icon.tsx
import clsx from 'clsx';
import { SVGProps, ForwardedRef, forwardRef } from 'react';
import { SpritesMap } from './sprite-definitions';

// Merging all icons as `SPRITE_NAME/SPRITE_ICON_NAME`
export type IconName = {
  [Key in keyof SpritesMap]: `${Key}/${SpritesMap[Key]}`;
}[keyof SpritesMap];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'type'> {
  name: IconName;
}

export function Icon({ name, className, viewBox, ...props }: IconProps) {
  const [spriteName, iconName] = name.split('/');

  return (
    <svg
      // We recommend to use specific component class for avoid collisions with other styles and simple override it
      className={clsx('icon', className)}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      {/* For example, "/common.svg#favourite". Change base path if you don't store sprites under the root. */}
      <use xlinkHref={`/${spriteName}.svg#${iconName}`} />
    </svg>
  );
}
```

#### Usage

```tsx
import { Icon } from '@/shared/ui';

export function SomeFeature() {
  return (
    <div className="space-y-4">
      <Icon name="common/add" />
      <Icon name="common/close" className="text-red-500" />
      <Icon name="text/bold" className="text-lg" />
      <Icon name="actions/delete" className="p-2 rounded-md bg-stone-300" />
    </div>
  );
}
```

### Multiple colors

Let's imagine that we have a really different icons with next requirements:

- We have some known list of the accent colors, and we want to specify them in our CSS
- All other colors should be inherited from the parent (for example, `currentColor`)

#### Configure `resetColors` option

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

#### Add CSS variables

```css
/* shared/ui/index.css */

@layer base {
  :root {
    /* make default accent color */
    --icon-primary-color: #6c707e;
  }
}
```

#### Usage

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

## API

### Node.JS API

```typescript
import { buildSprites } from '@neodx/svg';
import { createVfs } from '@neodx/vfs';

await buildSprites({
  vfs: createVfs(process.cwd()),
  root: 'assets',
  input: '**/*.svg',
  output: 'public',
  definition: 'src/shared/ui/icon/sprite.h.ts'
});
```

### CLI Options

| option                     | default                         | description                                                                                                                         |
| -------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `-i`, `--input`            | `"**/*.svg"`                    | Glob paths to icons files (output path will be automatically excluded)                                                              |
| `-o`, `--output`           | `"public/sprites"`              | Base path to generated sprite/sprites folder                                                                                        |
| `-d`, `--definitions`      | Not provided (**disabled**)     | Path to generated TS file with sprite meta                                                                                          |
| `--root`                   | `"."` (same as the current dir) | Base path to your assets, useful for correct groups names<br/>**careful:** `--input` should be relative to `--root`                 |
| `--group`                  | `false`                         | Should we group icons by folders?                                                                                                   |
| `--dry-run`                | `false`                         | Print proposal of generated file paths without actually generating it                                                               |
| `--optimize`               | `true`                          | Should we optimize SVG with [svgo](https://github.com/svg/svgo)?                                                                    |
| `--reset-color-values`     | `"#000,#000000"`                | An array of colors to replace as `currentColor`                                                                                     |
| `--reset-unknown-colors`   | `false`                         | Should we set `currentColor` for all colors not defined in `--reset-color-values`, or for all colors if this option isn't provided? |
| `--reset-color-properties` | `"fill,stroke"`                 | An array of SVG properties that will be replaced with `currentColor` if they're present                                             |

> **Note:** `--reset-color-values` and `--reset-color-properties` are strings with comma-separated values, don't forget to wrap them with quotes:
>
> `sprite ... --reset-color-values "#000,#000000,#fff"`
