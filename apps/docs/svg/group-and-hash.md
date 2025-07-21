# Group and Hash

The Group and Hash feature provides sprite organization and content-based hashing capabilities. It allows you to group sprites by directory structure and generate unique filenames based on content.

## Usage

Configure grouping and hashing in your builder:

```typescript
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  group: true,
  fileName: '{name}.{hash:8}.svg',
  defaultSpriteName: 'sprite'
});
```

## Configuration

### Grouping Options

```typescript
interface CreateSvgSpriteBuilderParams {
  /**
   * Sprite grouping mode
   * - `true` - use dirname as sprite name
   * - `false` - don't group sprites, use defaultSpriteName
   * - Function - custom grouping logic
   * @default true
   */
  group?: boolean | ((file: SymbolMeta) => string);
  /**
   * Template of sprite file name
   * @example {name}.svg
   * @example sprite-{name}.svg
   * @example {name}-{hash}.svg
   * @example {name}-{hash:8}.svg
   * @default {name}.svg
   */
  fileName?: string;
  /**
   * Default sprite name for root-level files
   * @default 'sprite'
   */
  defaultSpriteName?: string;
  /**
   * Resolves symbol name for the given file path
   * @default path => cases.kebab(basename(path, '.svg'))
   */
  getSymbolName?: (path: string) => string;
}
```

### FileName Template

The `fileName` option supports the following variables:

- `{name}` - sprite name (directory name when grouped)
- `{hash}` - full content hash
- `{hash:N}` - truncated hash of N characters

## Examples

### Basic Usage

```typescript
// Group by directory and use content hash
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  group: true,
  fileName: '{name}.{hash:8}.svg'
});
```

### Single Sprite

```typescript
// Don't group sprites, use default name
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  group: false,
  defaultSpriteName: 'icons',
  fileName: '{name}.{hash:8}.svg'
});
```

### Custom Grouping

```typescript
// Group by custom logic
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  group: ({ node, path }) => `${dirname(path)}/${node.props['data-category']}`,
  fileName: '{name}.{hash:8}.svg'
});
```

### Custom Symbol Names

```typescript
// Customize symbol naming
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  group: true,
  fileName: '{name}.{hash:8}.svg',
  getSymbolName: path => basename(path, '.svg') // don't force any case
});
```

## Best Practices

1. **Grouping Strategy**

   - Use meaningful directory names
   - Consider custom grouping for complex structures
   - Use defaultSpriteName for root-level icons

2. **File Naming**

   - Always use content-based hashing
   - Use shorter hashes (8 chars) for development
   - Use longer hashes (12+ chars) for production

3. **Symbol Names**

   - Use kebab-case by default
   - Customize naming strategy if needed
   - Keep names consistent across sprites

4. **Integration**
   - Use metadata for type-safe sprite access
   - Configure proper base URL for external assets
   - Handle sprite loading errors appropriately

## Sprite Mode

When processing sprites, the feature:

1. Groups symbols based on configuration
2. Generates unique filenames
3. Maintains sprite structure
4. Preserves symbol relationships

## Next Steps

- Learn about [sprite generation](./api/features/sprite.md)
- Check out [metadata generation](./metadata.md)
- Explore [advanced configuration options](./api/builder.md)
