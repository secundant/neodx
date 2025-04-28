# CDN Compatibility

When hosting SVG sprites on a CDN or different domain, you may encounter two major issues:

1. **CORS Restrictions** - Browsers block cross-origin requests for SVG sprites
2. **ID Reference Issues** - Internal SVG references (`url(#id)`, `href="#id"`) don't work across domains

## The Problem

The SVG specification and browser implementations don't fully support cross-origin SVG sprites:

- [SVG WG Issue #707](https://github.com/w3c/svgwg/issues/707#issuecomment-895914972)
- [Chromium Issue #41164645](https://issues.chromium.org/issues/41164645#comment15)

This means that when you try to use an SVG sprite hosted on a CDN:

```html
<!-- This won't work if hosted on a different domain -->
<svg>
  <use href="https://cdn.example.com/sprites.svg#icon-name" />
</svg>
```

## The Solution

We provide an inlining mechanism that solves these issues by automatically handling the extraction and injection of symbols at runtime.

### Configuration

```typescript
// Example: Configure inlining for CDN-hosted sprites
// This setup will extract and fetch symbols at runtime to work around CORS restrictions
export default defineConfig({
  plugins: [
    svg({
      inline: {
        // Extract inlined symbols into separate files
        extract: true,
        // Inline all symbols to ensure they work when fetched from CDN
        filter: 'all',
        // Customize the generated asset name
        assetName: 'inlined-{name}'
      }
    })
  ]
});
```

### How It Works

1. During build:

   - Symbols are extracted into separate files
   - Each file gets a unique name based on content hash
   - References are updated to use the new IDs

2. At runtime:
   - The sprite is fetched from the CDN
   - Symbols are extracted and injected into the document
   - All ID references work correctly

### Example

```typescript
// Example: Before and after inlining
// This shows how the sprite reference changes after inlining

// Before inlining
<svg>
  <use href="https://cdn.example.com/sprites.svg#icon-name" />
</svg>

// After inlining
<svg>
  <use href="#sprite-icon-name-abc123" />
</svg>
```

## Best Practices

1. **Performance**

   - Use content-based hashing for cache optimization
   - Monitor the size of inlined symbols

2. **Error Handling**

   - Always provide a fallback for failed loads
   - Monitor inlining results for potential issues
   - Test in different browsers

3. **Configuration**
   - Use `filter: 'all'` to ensure all symbols work when fetched from CDN

## Related

- [Inlining Guide](../inlining.md)
- [Sprite Generation](../sprite.md)
- [Metadata Generation](../metadata.md)
