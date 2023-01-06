# @neodx/svg

Supercharge your icons ⚡️

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
is better than a super-efficient, but the unusable setup with semi-manual generators.

That's why we're here! 🥳

- TypeScript - definitions with names and groups
- Grouping by folders (I have plans to make it hyper-flexible)
- Filtering
- Optimization
- Auto colors reset

> WIP

## Installation and usage

```
yarn add @neodx/svg
yarn sprite --help
yarn sprite -o public -d shared/icon/meta.ts
```

## Options

| option           | default          | description                                                                                 |
| ---------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `-r`, `--root`   | `.`              | Base path to your assets, useful for correct groups names                                   |
| `-i`, `--input`  | `**/*.svg`       | Paths to icons files. You can pass multiple and negative (`!**/*.excluded.svg`) expressions |
| `-o`, `--output` | `public/sprites` | Base path to generated sprite/sprites folder                                                |
| `-g`, `--group`  | `false`          | Should we group icons?                                                                      |
| `-d`, `--ts`     | `-`              | Path to generated TS file with sprite meta                                                  |

## Step-by-step example

### Build icons

```bash
yarn sprite --group --root assets -o public/sprite --ts src/shared/ui/icon/sprite-definitions.ts
```

```diff
...
shared/
  ui/
    icon/
+      sprite-definitions.ts
public/
+  sprite/
+    common.svg
+    other.svg
  my-icons-source-folder/
    common/
      add.svg
      close.svg
    other/
      cut.svg
      search.svg
```

### Create your Icon component

It's a simple implementation, you can see a more real one in the "Recipes" section

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
      <use xmlnsXlink={`/public/sprite/${type}.svg#${name}`}></use>
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
