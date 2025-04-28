# Sprite Generation

The sprite generation feature creates optimized SVG sprites from your source icons. It supports both single-file and multi-file sprite generation, with various optimization and customization options.

## Usage

The sprite generation is configured through the builder options:

```typescript
svg({
  // Root path for the input files
  inputRoot: 'src/shared/ui/icon/assets',
  // Path to generated sprite/sprites folder
  output: 'public/sprites',
  // Sprite grouping mode
  group: true,
  // Template of sprite file name
  fileName: '{name}.svg',
  // Default sprite name for root-level files
  defaultSpriteName: 'sprite'
});
```

## Configuration

### Sprite Options

```typescript
interface CreateSvgSpriteBuilderParams {
  /** Root path for the input files */
  inputRoot?: string;
  /** Path to generated sprite/sprites folder */
  output?: string;
  /**
   * Sprite grouping mode
   * - `true` - use dirname as sprite name
   * - `false` - don't group sprites, use defaultSpriteName
   * - Function - custom grouping logic
   */
  group?: boolean | ((file: SymbolMeta) => string);
  /** Template of sprite file name */
  fileName?: string;
  /** Default sprite name for root-level files */
  defaultSpriteName?: string;
  /** Resolves symbol name for the given file path */
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
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  group: true,
  fileName: '{name}.{hash:8}.svg'
});
```

### Single Sprite

```typescript
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
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  group: ({ node, path }) => `${dirname(path)}/${node.props['data-category']}`,
  fileName: '{name}.{hash:8}.svg'
});
```

### Custom Symbol Names

```typescript
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

   - Use meaningful directory names for better organization
   - Consider using custom grouping for complex structures
   - Use defaultSpriteName for root-level icons

2. **File Naming**

   - Always use content-based hashing for sprites
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

## Integration with Metadata

To use sprites effectively, you should:

1. Configure metadata generation:

```typescript
svg({
  inputRoot: 'src/shared/ui/icon/assets',
  output: 'public/sprites',
  group: true,
  fileName: '{name}.{hash:8}.svg',
  metadata: 'src/sprite.gen.ts'
});
```

2. Use the generated metadata in your icon component:

```tsx
import { sprites, type SpritesMeta } from './sprite.gen';

// Type for icon names in format "sprite:icon"
type IconName = {
  [Key in keyof SpritesMeta]: `${Key}:${SpritesMeta[Key]}`;
}[keyof SpritesMeta];

function Icon({ name }: { name: IconName }) {
  const [spriteName, iconName] = name.split(':');
  const item = sprites.experimental_get(spriteName, iconName, {
    baseUrl: '/sprites/'
  });

  if (!item) {
    console.error(`Icon "${name}" is not found in "${spriteName}" sprite`);
    return null;
  }

  const { symbol, href } = item;

  return (
    <svg viewBox={symbol.viewBox} focusable="false" aria-hidden>
      <use href={href} />
    </svg>
  );
}
```

## Example Output

With the above configuration, you'll get:

```
/
├── src
│   ├── icons
│   │   ├── common
│   │   │   ├── left.svg
│   │   │   └── right.svg
│   │   └── actions
│   │       └── close.svg
│   └── sprite.gen.ts
└── public
    └── sprites
        ├── common.12ghS6Uj.svg
        └── actions.1A34ks78.svg
```

## Benefits

1. **Performance**

   - Reduced number of HTTP requests
   - Better caching with content-based hashes
   - Optimized SVG code

2. **Maintenance**

   - Centralized icon management
   - Type-safe icon access
   - Easy icon updates

3. **Flexibility**
   - Multiple sprite generation strategies
   - Customizable grouping logic
   - Integration with various frameworks

## Next Steps

- Learn about [metadata generation](./metadata.md)
- Check out [icon component examples](../../writing-icon-component.md)
- Explore [advanced configuration options](../builder.md)
