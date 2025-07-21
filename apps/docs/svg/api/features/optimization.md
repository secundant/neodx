# Optimization API

The optimization feature provides comprehensive SVG optimization capabilities through the [SVGO](https://github.com/svg/svgo) library. This document covers the complete API and configuration options.

::: tip
For a quick introduction to optimization, see the [top-level documentation](../../optimization.md).
:::

## API Reference

### Configuration Options

```typescript
interface CreateSvgoConfigParams {
  /**
   * Additional attributes to remove
   * By default we remove next attributes:
   * - '(class|style)'
   * - 'xlink:href'
   * - 'aria-labelledby'
   * - 'aria-describedby'
   * - 'xmlns:xlink'
   * - 'data-name'
   */
  removeAttrs?: string[];
  /**
   * Override default SVGO config
   */
  config?: Config | boolean;
}
```

### Default Configuration

The optimization uses a default configuration that includes:

```typescript
{
  config: {
    plugins: [
      {
        name: 'cleanupIds',
        params: {
          minify: false,
          remove: false
        }
      },
      { name: 'removeTitle' },
      { name: 'removeDesc' },
      { name: 'removeComments' },
      { name: 'removeMetadata' },
      { name: 'removeEditorsNSData' },
      { name: 'cleanupAttrs' },
      { name: 'mergeStyles' },
      { name: 'inlineStyles' },
      { name: 'minifyStyles' },
      { name: 'convertStyleToAttrs' },
      { name: 'cleanupIDs' },
      { name: 'prefixIds' },
      { name: 'removeRasterImages' },
      { name: 'removeUselessDefs' },
      { name: 'cleanupNumericValues' },
      { name: 'cleanupListOfValues' },
      { name: 'convertColors' },
      { name: 'removeUnknownsAndDefaults' },
      { name: 'removeNonInheritableGroupAttrs' },
      { name: 'removeUselessStrokeAndFill' },
      { name: 'removeViewBox' },
      { name: 'cleanupEnableBackground' },
      { name: 'removeHiddenElems' },
      { name: 'removeEmptyText' },
      { name: 'convertShapeToPath' },
      { name: 'convertEllipseToCircle' },
      { name: 'moveElemsAttrsToGroup' },
      { name: 'moveGroupAttrsToElems' },
      { name: 'collapseGroups' },
      { name: 'convertPathData' },
      { name: 'convertTransform' },
      { name: 'removeEmptyAttrs' },
      { name: 'removeEmptyContainers' },
      { name: 'mergePaths' },
      { name: 'removeUnusedNS' },
      { name: 'sortDefsChildren' }
    ];
  }
}
```

## Usage Examples

### Basic Usage

```typescript
// Enable optimization with default config
const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  optimize: true
});
```

### Disable Optimization

```typescript
// Disable optimization completely
const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  optimize: false
});
```

### Custom Configuration

```typescript
// Use custom SVGO configuration
const builder = createSvgSpriteBuilder({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  optimize: {
    config: {
      plugins: [
        { name: 'removeTitle' },
        { name: 'removeDesc' },
        {
          name: 'cleanupIds',
          params: {
            minify: false,
            remove: false
          }
        }
      ]
    }
  }
});
```

## Advanced Topics

### Sprite Mode Behavior

When processing sprites, the optimization:

1. Preserves IDs for sprite symbols
2. Optimizes individual symbols
3. Maintains sprite structure
4. Handles symbol references

### ID Handling

- IDs are preserved by default for sprite symbols
- Use `cleanupIds` with `minify: false` for sprites
- Consider using `remove: false` for better debugging

### Attribute Management

- Essential attributes are preserved
- Unnecessary attributes are removed
- Accessibility attributes are considered

## Related Documentation

- [Sprite Generation](./sprite.md) - Learn about sprite generation
- [Builder API](../builder.md) - Explore advanced configuration options
- [Color Reset](../../colors-reset.md) - Learn about color management
