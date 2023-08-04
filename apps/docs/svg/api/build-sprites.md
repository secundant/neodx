# `buildSprites`

Top-level function to build sprites without any manual actions.

```typescript
declare function buildSprites(params: BuildSpritesParams): Promise<void>;
```

## Usage

```typescript
await buildSprites({
  root: 'assets/icons',
  input: '**/*.svg',
  output: 'public/sprites'
});
```

## `BuildSpritesParams`

- [`CreateSpriteBuilderParams`](./create-sprites-builder.md#createspritebuilderparams)

```typescript
export interface BuildSpritesParams extends CreateSpriteBuilderParams {
  /**
   * Globs to icons files
   */
  input: string | string[];
  /**
   * Keep tree changes after generation even if dry-run mode is enabled
   * Useful for testing (for example, to check what EXACTLY was changed)
   */
  keepTreeChanges?: boolean;
}
```
