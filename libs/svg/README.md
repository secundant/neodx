# @neodx/svg

Try better way to build your icons 👈

Sprite is mostly effective way how to work with your svg icons,
but for some reason developers (vision from react world) prefer
mostly bloated and ineffective - "compile" svg to react component with inlined svg content.

Of course, we can use some external tools like https://svgsprit.es/ or some npm libraries,
but it's worst (if you know some alternatives - let me know, I'll add links), developers needs DX.

It's ridiculous, but incredibly popular way, but we haven't any other solutions withs same DX.

Just think about it a bit, you need to "compile" svg, to inline your secondary static content into JSX,
to give additional source code, extra bundle time, extra bundle size, user's browser will parse and evaluate your
**static svg** as JS code, you never will be able to cache it, WOOF, etc., etc.

And yes, developers continue to use this insanity because even an incredibly inefficient setup with good DX
better than super-efficient, but unusable setup with half-manual generators.

That's why we're here! 🥳

- TypeScript - definitions with names and groups
- Grouping by folders (I have plans to make it hyper-flexible)
- Filtering
- Optimization
- Auto colors reset

> WIP

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
