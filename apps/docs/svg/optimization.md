# SVG Optimization

The SVG optimization feature in @neodx/svg uses the [SVGO](https://github.com/svg/svgo) library to optimize your SVGs and sprites. This reduces file size, removes unnecessary data, and ensures your icons are production-ready.

## Quick Start

Enable optimization in your builder (default: `true`):

```typescript
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  optimize: true // Enable with default config
});
```

## Key Features

- **Automatic Optimization**: Optimizes SVGs and sprites with sensible defaults
- **Sprite Support**: Preserves IDs and structure for sprite symbols
- **Custom Configuration**: Fine-tune optimization with SVGO plugins
- **Performance**: Reduces file size while maintaining quality
- **Disable or override**: Set `optimize: false` to skip optimization, or pass a custom config

## Custom Configuration

You can pass a custom SVGO config for advanced control:

```typescript
svg({
  optimize: {
    config: {
      plugins: [
        { name: 'removeTitle' },
        { name: 'removeDesc' }
        // Add or override plugins as needed
      ]
    }
  }
});
```

- See [SVGO documentation](https://github.com/svg/svgo) for all available plugins and options.

## Sprite Optimization Details

When processing sprites, optimization:

1. Preserves IDs for sprite symbols (using `cleanupIds` with `minify: false, remove: false`)
2. Optimizes individual symbols and the overall sprite
3. Maintains sprite structure and symbol references
4. Handles accessibility and removes unnecessary attributes

## Disabling Optimization

You can disable optimization entirely:

```typescript
svg({
  optimize: false
});
```

## Best Practices

- Use the default optimization for most projects
- Customize only if you have specific needs (e.g., preserve certain attributes)
- Test your icons visually after changing optimization settings
- For advanced troubleshooting, check the [SVGO documentation](https://github.com/svg/svgo)

## Related

- [Optimization API Reference](./api/features/optimization.md)
- [Builder API](./api/builder.md)
- [Color Reset](./colors-reset.md)
- [Sprite Grouping](./group-and-hash.md)
- [Writing Icon Component](./writing-icon-component.md)
