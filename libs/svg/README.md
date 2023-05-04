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
- Optional grouping by folders
- Optimization with svgo
- Built-in colors reset
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

You can try it even without any configuration, just run `sprite` command:

```shell
yarn sprite
```

It will search for all SVG files except files in `public/sprites` folder and generate sprites in `public/sprites`.

In default mode, it will be the single sprite with all icons without grouping and TS definitions, but you can customize it, see below.

## Options

| option                     | default                         | description                                                                                                         |
| -------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `-i`, `--input`            | `"**/*.svg"`                    | Glob paths to icons files (output path will be automatically excluded)                                              |
| `-o`, `--output`           | `"public/sprites"`              | Base path to generated sprite/sprites folder                                                                        |
| `-d`, `--definitions`      | Not provided (**disabled**)     | Path to generated TS file with sprite meta                                                                          |
| `--root`                   | `"."` (same as the current dir) | Base path to your assets, useful for correct groups names<br/>**careful:** `--input` should be relative to `--root` |
| `--group`                  | `false`                         | Should we group icons by folders?                                                                                   |
| `--dry-run`                | `false`                         | Print proposal of generated file paths without actually generating it                                               |
| `--optimize`               | `true`                          | Should we optimize SVG with [svgo](https://github.com/svg/svgo)?                                                    |
| `--reset-color-values`     | `"#000,#000000"`                | An array of colors to replace as `currentColor`                                                                     |
| `--reset-color-properties` | `"fill,stroke"`                 | An array of SVG properties that will be replaced with `currentColor` if they're present                             |

> **Note:** `--reset-color-values` and `--reset-color-properties` are strings with comma-separated values, don't forget to wrap them with quotes:
>
> `sprite ... --reset-color-values "#000,#000000,#fff"`

## Step-by-step

### Build icons

Let's run `sprite` with some additional options:

```bash
yarn sprite --group --root assets -o public/sprite -d src/shared/ui/icon/sprite.h.ts
```

As a result, we will get:

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
assets/
  common/
    add.svg
    close.svg
  other/
    cut.svg
    search.svg
```

In details:

- with `--group` option we will group icons by folders (`common` and `other`)
- with `--root` option we will use `assets` as a base path for icons (you can try to remove it and see the difference)
- with `-o` option we will use `public/sprite` as a base path for generated sprites (it's default value, but let's keep it for now)
- with `-d` option we will generate TS definitions file with sprite meta

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

### Real Icon component ([see example](./examples/react))

```tsx
// shared/ui/icon/icon.tsx
import clsx from 'clsx';
import { SVGProps, ForwardedRef, forwardRef } from 'react';
import { SpritesMap } from './sprite-definitions';

export type SpriteKey = {
  [Key in keyof SpritesMap]: `${Key}/${SpritesMap[Key]}`;
}[keyof SpritesMap];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'type'> {
  name: SpriteKey;
}

export function Icon({ name, className, viewBox, ...props }: IconProps) {
  const [spriteName, iconName] = name.split('/');

  return (
    <svg
      className={clsx(
        'select-none fill-current w-[1em] h-[1em] inline-block text-inherit',
        className
      )}
      viewBox={viewBox}
      focusable="false"
      aria-hidden
      {...props}
    >
      <use xlinkHref={`/path/to/sprites/${spriteName}.svg#${iconName}`} />
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
      <Icon name="common/close" />
      <Icon name="other/search" />
    </div>
  );
}
```
