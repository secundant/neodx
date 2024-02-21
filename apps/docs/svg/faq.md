# FAQ

::: danger
WIP
:::

## Why do SVG components have bad DX?

::: tip
"Bad" compared to the single file approach with sprites under the hood.
:::

- Longer build time and larger bundle size.
- To render an icon, we need to import it first.
- We are unable to search or receive autocomplete suggestions for icons.
- We should always work with components, not just names.

For example, you need to render an icon depending on some condition:

```tsx
import MapIcon from 'shared/ui/icons/map';
import LikeIcon from 'shared/ui/icons/like';
import CloseIcon from 'shared/ui/icons/close';
// Direct imports could be replaced with barrel imports, but they will cause issues with tree shaking and development build time.
// By barrel import, I mean something like this:
// import * as Icons from 'shared/ui/icons';
import { MapIcon, LikeIcon, CloseIcon } from 'shared/ui/icons';

const icons = {
  map: MapIcon,
  like: LikeIcon,
  close: CloseIcon
} as const;

function SomeComponent({ icon }: { icon: keyof typeof icons }) {
  const Icon = icons[icon];

  return <Icon />;
}
```

vs

```tsx
import { Icon } from 'shared/ui/icon';

function SomeComponent({ icon }: { icon: 'map' | 'like' | 'close' }) {
  return <Icon name={icon} />; // autocomplete, type safety, single import
}
```

You can say that it's not a common case, but it's not true. We always need to work with components and make that overhead.

We're constantly writing

```tsx
// this
import MapIcon from 'shared/ui/icons/map';

<Button startIcon={<MapIcon />}>Map</Button>

// instead of this
<Button startIcon="map">Map</Button>
```

We need to write imports and remember the names. We are restricted to using components and must write code that is highly coupled and depends on the specific implementation, rather than tokens.

## Why sprites?

::: warning
I'm not attempting an in-depth analysis of every technique; I'm simply reviewing the most common aspects.

If you have a specific case with different priorities and requirements, you should research it yourself.
:::

In general, when we're working with any static assets, not with icons only, we need to focus on the following aspects:

- Performance
- Side effects
- Scalability
- Caching
- DX

Let's compare the following approaches:

- SVG in JS (like [svgr](https://react-svgr.com/))
  - Pros:
    - On-demand loading
    - No additional requests
  - Cons:
    - Extra build time and bundle size
    - Static SVG is parsed and evaluated as JS code
    - Broken caching (any source code change will cause a new bundle, chunks consistency isn't guaranteed)
    - [Bad DX](#why-do-svg-components-have-bad-dx)
- Inlined SVG - TODO
  - Pros:
    - Immediate rendering
    - No additional requests and files
    - No issues with `url(#filter-id)`, `url(#mask-id)`, gradients, etc.
- Inlined sprites - TODO
- External sprites - TODO

## Why not always inline SVG? - TODO

First of all, what are the benefits of inlined SVGs?

- Immediate rendering
- No additional requests and files
- No issues with `url(#filter-id)`, `url(#mask-id)`, gradients, etc.

And for some cases, it's perfect to have inlined SVGs. But in most cases, it's not.

TODO: Real case 72 иконки - 300кб
