# Extending the VFS

The `@neodx/vfs` provides a powerful plugin system that allows you to extend the VFS functionality with any custom logic.

Even the built-in features like [glob](./plugins/glob.md) or [prettier](./plugins/prettier.md) are implemented as plugins and could be dropped (see [createHeadlessVfs](./api/create-vfs.md#createheadlessvfs)).
`createVfs` is literally implemented as a composition of plugins:

```typescript
function createVfs(path, params) {
  return createHeadlessVfs(path, params).pipe(
    json(),
    scan(),
    glob(),
    eslint(/* ... */),
    prettier(/* ... */),
    packageJson()
  );
}
```

Let's overview the plugin system and see how to create a custom plugin.

## Using plugins

The concept of plugins is very simple: `vfs` provides a `.pipe` method that accepts a list of plugins and returns a new `vfs` instance with the plugin applied.

```typescript
import { createHeadlessVfs, json, scan } from '@neodx/vfs';

const vfs = createHeadlessVfs('path/to/dir');

const vfsWithJson = vfs.pipe(json());
const vfsWithJsonAndScanV1 = vfs.pipe(json(), scan());
// same as
const vfsWithJsonAndScanV2 = vfsWithJson.pipe(scan());
```

Plugins should provide types for their extensions, so you will always know what methods are available on the `vfs` instance.

Under the hood types are a bit more complex, but in the result you will see clean and safe types, for example:

```typescript
export async function readManifests(vfs = defaultVfs) {
  const manifests = await vfs.glob('**/manifest.json');
  const entries = await Promise.all(
    manifests.map(async path => [path, await vfs.readJson(path)] as const)
  );

  return Object.entries(entries);
}

const defaultVfs = createHeadlessVfs(process.cwd()).pipe(glob(), json());
//    ^?  PublicVfs<BaseVfs & GlobPluginApi & JsonPluginApi>

// OK
await readManifests(createVfs('/'));
// OK
await readManifests(createHeadlessVfs('/').pipe(json(), glob(), eslint()));
// ERROR!
await readManifests(createHeadlessVfs('/').pipe(json()));
```

<img src="/vfs/example-vfs-types-mismatch.png" width="1664" height="802" alt="Types error" />

## Writing plugins

Plugins are just functions that accept `vfs` instance and return a new `vfs` instance with additional methods (mutable style if prefer).

Plugins should be created with `createVfsPlugin` factory.

A minimal plugin looks like this:

```typescript
import { createVfsPlugin, createHeadlessVfs } from '@neodx/vfs';

type MyPluginExtensions = {
  myMethod(): string;
};

const plugin = createVfsPlugin<MyPluginExtensions>('my-plugin', vfs => {
  vfs.myMethod = () => 'Hello, world!';
  return vfs;
});

const vfs = createHeadlessVfs('/').pipe(plugin);

vfs.myMethod(); // Hello, world!
```

Plugin also accepts a private API that could be used to subscribe to `vfs` events and access the [context](./api/context.md) object.

Let's create a plugin that will install npm dependencies on `package.json` change.

```typescript
type NpmPluginApi = {
  install(): Promise<void>;
};

const npm = createVfsPlugin<NpmPluginApi>('npm', (vfs, { context, beforeApply }) => {
  const log = context.log.child('npm');

  vfs.install = async () => {
    log.info('Installing dependencies...');
    await exec('npm install', { cwd: context.path });
  };

  beforeApply(async changes => {
    if (!changes.some(change => change.path.endsWith('package.json'))) return;
    log.info('package.json changed');
    await vfs.install();
  });
  return vfs;
});
```

Now we can use it everywhere:

```typescript
const vfs = createHeadlessVfs('/').pipe(json(), npm);

await vfs.install(); // install dependencies
await vfs.updateJson('package.json', json => {
  json.dependencies = { ...json.dependencies, 'my-package': '1.0.0' };
});
await vfs.apply(); // install will be called automatically, because package.json changed
```

## Built-in plugins

We have a few built-in plugins that you can use out of the box:

- [glob](./plugins/glob.md)
- [json](./plugins/json.md)
- [scan](./plugins/scan.md)
- [eslint](./plugins/eslint.md)
- [prettier](./plugins/prettier.md)
- [packageJson](./plugins/package-json.md)
