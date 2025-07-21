# Inlining

SVG inlining is a powerful feature that solves two major browser compatibility issues:

1. **CDN Compatibility** - External SVG sprites hosted on different domains (like CDNs) don't work due to CORS restrictions
2. **ID References** - Internal SVG references (`url(#id)`, `href="#id"`) break when symbols are loaded from external files

## Configuration

The inlining feature is configured through the `inline` option in your SVG plugin configuration:

```typescript
// Example: Basic inlining configuration
// This shows all available options with their default values
export default defineConfig({
  plugins: [
    svg({
      inline: {
        // Extract inlined symbols into separate files
        extract: false,
        // Inline recognition strategy
        filter: 'auto', // 'auto' | 'none' | 'all' | ((symbol: SymbolMeta) => boolean)
        // Name of the generated asset for "extract: true" mode
        assetName: 'inlined-{name}',
        // Name of the merged sprite for "merge: true" mode
        mergeName: 'all',
        // Merge all inlined symbols into a single sprite
        merge: false
      }
    })
  ]
});
```

### Options

- `extract` (boolean) - Extract inlined symbols from sprites

  - `true` - inlined symbols will be extracted as separate assets and marked as "fetch-and-inject"
  - `false` - inlined symbols will be injected into the document as "inject" assets
  - Default: `false`

- `filter` (string | function) - Inline recognition strategy

  - `'auto'` - (default) detects all symbols that reference other symbols
  - `'none'` - disables inlining
  - `'all'` - inlines all symbols
  - `(symbol: SymbolMeta) => boolean` - custom filter function
  - Default: `'auto'`

- `assetName` (string | function) - Name of the generated asset for "extract: true" mode

  - You can use `{name}` placeholder to include sprite name
  - Default: `'inlined-{name}'`

- `mergeName` (string) - Name of the merged sprite for "merge: true" mode

  - Default: `'all'`

- `merge` (boolean) - Merge all inlined symbols into a single sprite
  - Default: `false`

## Usage Examples

### Fix CDN Compatibility Issues

```typescript
// Example: Configure inlining for CDN-hosted sprites
// This setup will extract and fetch symbols at runtime to work around CORS restrictions
export default defineConfig({
  plugins: [
    svg({
      inline: {
        extract: true, // Extract inlined symbols as separate files
        filter: 'all' // Inline all symbols to ensure they work when fetched from CDN
      }
    })
  ]
});
```

### Fix ID Reference Issues

```typescript
// Example: Configure inlining for symbols with ID references
// This setup will automatically detect and inline symbols that use ID references
export default defineConfig({
  plugins: [
    svg({
      inline: {
        filter: 'auto' // Automatically detect symbols with ID references
      }
    })
  ]
});
```

### Merge All Inlined Symbols

```typescript
// Example: Configure inlining to merge all symbols into a single file
// This setup will combine all inlined symbols into one sprite file
export default defineConfig({
  plugins: [
    svg({
      inline: {
        merge: true,
        mergeName: 'all-inlined',
        filter: 'all' // Inline all symbols
      }
    })
  ]
});
```

## Best Practices

1. **CDN Hosting**

   - Use `extract: true` when hosting sprites on a CDN
   - Use `filter: 'all'` to ensure all symbols work when fetched from CDN
   - Use content-based hashing for cache optimization

2. **ID References**
   - Use `filter: 'auto'` to automatically detect symbols with ID references
   - Test inlined symbols in different browsers

## Related

- [CDN Compatibility Guide](./recipes/cdn-compatibility.md)
- [Sprite Generation](./api/features/sprite.md)
- [Metadata Generation](./metadata.md)
