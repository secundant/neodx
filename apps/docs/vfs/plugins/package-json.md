# `@neodx/vfs` - `packageJson` plugin <Badge type="tip" text="builtin" />

This plugin provides a set of helpful methods for working with JSON files.

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(process.cwd());
const pkg = vfs.packageJson(); // without config it will use `package.json` file

// Adding dependencies

// Shorthand syntax - adds prod dependencies
await pkg.addDependencies('foo'); // alias for { dependencies: { foo: "*" } }
await pkg.addDependencies(['foo', 'bar']); // alias for { dependencies: { foo: "*", bar: "*" } }
// Full syntax
await pkg.addDependencies({ devDependencies: 'foo' /** ...other deps */ });

// Removing dependencies

// Shorthand syntax - removes from ALL dependencies, alias for:
// removeDependencies({ dependencies: 'foo', devDependencies: 'foo', peerDependencies: 'foo', optionalDependencies: 'foo' })
await pkg.removeDependencies('foo');
await pkg.removeDependencies(['foo', 'bar']);
// Full syntax
await pkg.removeDependencies({ peerDependencies: 'foo' });

// also, all JsonFileApi methods are available:
const pkgJson = await pkg.readJson();

await pkg.writeJson({ ...pkgJson, name: 'new-name' });
await pkg.updateJson(json => ({ ...json, version: '1.0.0' }));
```

## Adding dependencies

```typescript
// Shorthand syntax - adds prod dependencies

// alias for { dependencies: { foo: "*" } }
await pkg.addDependencies('foo');
// alias for { dependencies: { foo: "*", bar: "*" } }
await pkg.addDependencies(['foo', 'bar']);

// Full syntax
await pkg.addDependencies({ devDependencies: 'foo' /** ...other deps */ });
```

## Removing dependencies

```typescript
/**
 * Shorthand syntax - removes from all dependencies, alias for
 * pkg.removeDependencies({
 *   dependencies: 'foo',
 *   devDependencies: 'foo',
 *   peerDependencies: 'foo',
 *   optionalDependencies: 'foo'
 * })
 */
await pkg.removeDependencies('foo');
await pkg.removeDependencies(['foo', 'bar']);

// Full syntax
await pkg.removeDependencies({ peerDependencies: 'foo' });
```

## API

- [JsonFileApi](./json.md)

```typescript
interface PackageJsonPluginApi {
  packageJson(path?: string): PackageJsonApi;
}

// File API
interface PackageJsonApi extends JsonFileApi<PackageJson> {
  addDependencies(deps: string | string[] | PackageJsonDependencies): Promise<boolean>;
  removeDependencies(deps: Record<string, string>): Promise<boolean>;
}
```
