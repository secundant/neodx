# @neodx/svg

Try better way to build your icons 👈

Sprite is mostly effective way to work with your svg icons,
but for some reason developers (vision from react world) prefer
mostly bloated and ineffective - "compile" svg to react component with inlined svg content.

Of course, we can use some external tools like https://svgsprit.es/ or some npm libraries,
but that's not serious (if you know any alternatives - let me know, I'll add links), developers need DX.

A ridiculous, but incredibly popular way, we don't have other solutions withs the same DX.

Just think about it a little, you need to "compile" svg, to embed your secondary static content in JSX
and get a lot of unwanted issues: additional source code, extra build time, extra bundle size,
the user's browser will parse and evaluate your **static svg** as JS code,
you can never cache it, WOOF, etc., etc.

And yes, developers keep using this insanity because even an incredibly inefficient solution with a good DX
is better than super efficient but unusable setup with semi-manual generators.

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
| `-d`, `--ts`     | `false`          | Path to generated TS file with sprite meta                                                  |

## Example

### Build icons

```bash
yarn sprite -g -i public/my-icons-source-folder/**/*.svg -o public/sprite --ts src/shared/ui/icon/sprite-definitions.ts
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

```tsx
// shared/ui/icon/icon.tsx
import { Groups } from './sprite-definitions';

export interface IconProps<Group extends keyof Groups> {
  name: Groups[Group];
  type?: Group;
}

export function Icon<Group extends keyof Groups = 'common'>({ type, name }: IconProps<Group>) {
  return (
    <svg>
      <use xmlnsXlink={`/public/sprite/${type}.svg#${name}`}></use>
    </svg>
  );
}
```

### Enjoy :)

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
