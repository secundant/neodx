# Automatic Cleanup

Keep your sprite output directory clean and up-to-date with automatic cleanup. This feature removes outdated sprite files when your icons change, preventing accumulation of unused assets and ensuring cache invalidation works properly.

## Why Cleanup Matters

When working with [content-based hashing](./group-and-hash.md), sprite filenames change whenever their content changes. Without cleanup, your output directory accumulates old sprite files that are no longer referenced:

```diff
public/sprites/
  common.a1b2c3d4.svg  # Old version
+ common.e5f6g7h8.svg  # New version after icon changes
  actions.x9y8z7w6.svg
```

This leads to:

- **Bloated deployments**: Unused files increase bundle size
- **Broken caching**: Old files might be served instead of new ones
- **Debugging confusion**: Multiple versions make troubleshooting harder
- **Storage waste**: Accumulating files consume unnecessary space

## Cleanup Modes

@neodx/svg provides three cleanup strategies:

### `'auto'` - Smart Cleanup (Recommended)

Removes only outdated sprites by comparing current build with previous metadata:

```typescript
svg({
  output: 'public/sprites',
  metadata: 'src/sprite.gen.ts', // Required for auto cleanup
  cleanup: 'auto' // Default when metadata is provided
});
```

**How it works:**

1. Reads previous build metadata to identify existing sprite files
2. Compares with current build output
3. Removes only files that are no longer generated
4. Preserves external files (not managed by @neodx/svg)

**Benefits:**

- ✅ Safe - only removes known outdated sprites
- ✅ Preserves external files in the output directory
- ✅ Fast - minimal file operations
- ✅ Reliable - based on actual build metadata

### `'force'` - Complete Cleanup

Deletes the entire output directory before building:

```typescript
svg({
  output: 'public/sprites',
  cleanup: 'force'
});
```

**How it works:**

1. Deletes the entire output directory
2. Recreates it with new sprites

**Benefits:**

- ✅ Guaranteed clean state
- ✅ Simple and predictable
- ✅ No metadata dependency

**Drawbacks:**

- ⚠️ Removes ALL files in output directory (including external ones)
- ⚠️ More aggressive than usually needed

### `false` - No Cleanup

Disables cleanup completely:

```typescript
svg({
  output: 'public/sprites',
  cleanup: false
});
```

**When to use:**

- Manual cleanup workflows
- Temporary debugging
- Custom deployment processes

## Configuration

### Default Behavior

```typescript
// Cleanup is automatically enabled when metadata is provided
svg({
  metadata: 'src/sprite.gen.ts'
  // cleanup: 'auto' - implicitly enabled
});

// No cleanup without metadata
svg({
  // cleanup: false - implicitly disabled
});
```

### Explicit Configuration

```typescript
svg({
  output: 'public/sprites',
  metadata: 'src/sprite.gen.ts',
  cleanup: 'auto' | 'force' | false
});
```

## Requirements

### For `'auto'` Mode

The `metadata` option is **required** for auto cleanup:

```typescript
svg({
  output: 'public/sprites',
  metadata: 'src/sprite.gen.ts', // ✅ Required
  cleanup: 'auto'
});
```

**Why metadata is needed:**

- Cleanup reads previous build metadata to know which files existed
- Compares current build with previous to identify outdated files
- Ensures only @neodx/svg-managed files are removed

**Without metadata, you'll see this error:**

```
For automatic cleanup you need to provide "metadata" option because we use it to determine which sprites are outdated.
```

### For `'force'` Mode

No special requirements - works independently:

```typescript
svg({
  output: 'public/sprites',
  cleanup: 'force' // ✅ No metadata required
});
```

## Troubleshooting

### Auto Cleanup Not Working

**Symptoms**: Old sprite files remain after builds

**Solutions**:

1. **Check metadata configuration**:

   ```typescript
   svg({
     metadata: 'src/sprite.gen.ts', // ✅ Required for auto cleanup
     cleanup: 'auto'
   });
   ```

2. **Verify metadata file exists**: Auto cleanup skips if no previous metadata file found

3. **Check file permissions**: Ensure write access to output directory

### Force Cleanup Too Aggressive

**Symptoms**: External files in output directory are deleted

**Solutions**:

1. **Switch to auto cleanup**:

   ```typescript
   svg({
     metadata: 'src/sprite.gen.ts',
     cleanup: 'auto' // ✅ Only removes sprite files
   });
   ```

2. **Use separate output directory**:
   ```typescript
   svg({
     output: 'public/sprites-only', // ✅ Dedicated directory
     cleanup: 'force'
   });
   ```

### Permission Errors

**Symptoms**: Cleanup fails with permission errors

**Solutions**:

1. **Check directory permissions**
2. **Ensure no files are locked by other processes**
3. **Run with appropriate user permissions in CI/CD**

## Integration

Cleanup works seamlessly with other @neodx/svg features:

- **[Metadata](./metadata.md)**: Required for auto cleanup, provides type safety
- **[Group and Hash](./group-and-hash.md)**: Content-based hashing creates need for cleanup
- **[CDN Compatibility](./recipes/cdn-compatibility.md)**: Clean builds ensure proper CDN cache invalidation

## Related

- [Metadata Generation](./metadata.md) - Required for auto cleanup
- [Group and Hash](./group-and-hash.md) - Creates need for cleanup with content-based hashing
- [API Reference](./api/builder.md) - Technical details about cleanup options
- [Setup Guides](./setup/index.md) - Integration examples for different bundlers
