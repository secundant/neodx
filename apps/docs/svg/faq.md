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
// Example: Using individual icon components
// This shows the overhead of importing and using individual icon components
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
// Example: Using a single Icon component with sprites
// This shows the better DX of using a single Icon component with sprites
import { Icon } from 'shared/ui/icon';

function SomeComponent({ icon }: { icon: 'map' | 'like' | 'close' }) {
  return <Icon name={icon} />; // autocomplete, type safety, single import
}
```

You can say that it's not a common case, but it's not true. We always need to work with components and make that overhead.

We're constantly writing

```tsx
// Example: Common icon usage pattern
// This shows the typical overhead of using individual icon components
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

- External sprites

  - Pros:
    - Perfect caching (content-based hashing)
    - Small bundle size
    - Great DX (single import, type safety)
  - Cons:
    - Additional HTTP request
    - Browser compatibility issues:
      - CORS restrictions when hosted on CDN
      - ID references (`url(#id)`, `href="#id"`) don't work across domains
    - Requires [inlining](./inlining.md) for complex cases

- Inlined sprites
  - Pros:
    - Immediate rendering
    - No additional requests
    - No browser compatibility issues
    - Perfect for small sets of icons
  - Cons:
    - Larger initial HTML size
    - No caching between pages
    - Not suitable for large icon sets

## How to handle browser compatibility issues?

We provide an inlining mechanism that solves two major browser compatibility issues:

1. **CDN Compatibility**

   - Problem: Browsers block cross-origin requests for SVG sprites
   - Solution: Configure the `inline` option in your SVG plugin:
     ```typescript
     // Example: Configure inlining for CDN-hosted sprites
     // This setup will extract and fetch symbols at runtime to work around CORS restrictions
     svg({
       inline: {
         extract: true,
         filter: 'all' // Inline all symbols to ensure they work when fetched from CDN
       }
     });
     ```

2. **ID Reference Issues**
   - Problem: Internal SVG references break when loaded from external files
   - Solution: Configure the `inline` option in your SVG plugin:
     ```typescript
     // Example: Configure inlining for symbols with ID references
     // This setup will automatically detect and inline symbols that use ID references
     svg({
       inline: {
         filter: 'auto'
       }
     });
     ```

For more details, see:

- [Inlining Guide](./inlining.md)
- [CDN Compatibility Guide](./recipes/cdn-compatibility.md)

## Why not always inline SVG?

First of all, what are the benefits of inlined SVGs?

- Immediate rendering
- No additional requests and files
- No issues with `url(#filter-id)`, `url(#mask-id)`, gradients, etc.

And for some cases, it's perfect to have inlined SVGs. But in most cases, it's not.

### Performance Impact

The main reason to avoid always inlining SVGs is performance:

1. **Initial Page Load**

   - Inlined SVGs increase your HTML size
   - For example, I've faced the real user's case where 72 icons added 300KB to the initial HTML payload
   - This delays First Contentful Paint (FCP) and Time to Interactive (TTI)

2. **Caching**

   - Inlined SVGs can't be cached separately
   - Each page load requires downloading the full HTML with all SVGs
   - External sprites can be cached by the browser and CDN

3. **Memory Usage**
   - Inlined SVGs are duplicated in memory for each page
   - External sprites are loaded once and reused

### When to Use Inlining

Use inlining when:

1. **Small Icon Sets**

   - You have a small number of icons (e.x. < 10)
   - The total size is negligible (e.x. < 10KB)

2. **Critical Icons**

   - Icons that must be visible immediately
   - Icons used in above-the-fold content

3. **Complex Icons**
   - Icons with filters, masks, or gradients
   - Icons that use ID references (`url(#id)`)

### When to Avoid Inlining

Avoid inlining when:

1. **Large Icon Sets**

   - You have many icons (e.x. > 20)
   - The total size is significant (e.x. > 50KB)

2. **Multi-page Applications**

   - Icons are used across multiple pages
   - You want to leverage browser caching

3. **CDN Hosting**
   - You want to serve icons from a CDN
   - You need to optimize delivery

### Best Practice

The best approach depends on your requirements and should be tailored to your needs.
Here are some possible configurations:

1. **Default to External Sprites**

   ```typescript
   // Use external sprites by default
   svg({
     inline: false
   });
   ```

2. **Inline Only When Necessary**

   ```typescript
   // Inline specific icons that need it
   svg({
     inline: {
       filter: 'auto' // Only inline icons with ID references
     }
   });
   ```

3. **Use CDN with Inlining**
   ```typescript
   // Use CDN with inlining for complex icons
   svg({
     inline: {
       extract: true,
       filter: 'all'
     }
   });
   ```
