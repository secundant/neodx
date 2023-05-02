<h1 align="center">
  <a aria-label="@neodx - Frontend toolkit" href="https://github.com/secundant/neodx">
    @neodx: Everyday instruments for web development
  </a>
</h1>
<hr />

This project designed to tackle common web development challenges with ease.

> **Warning**
> Most of the packages are still under development, so API may change.
> I'll try to keep it stable, but updates still can bring breaking changes.

### [@neodx/svg](./libs/svg)

Are you converting every SVG icon to React component with SVGR or something similar? It's so ease to use!

But wait, did you know that SVG sprites are native approach for icons? It's even easier to use!

```typescript jsx
import { Icon } from '@/shared/ui';

export const MyComponent = () => (
  <>
    <Icon name="check" />
    <Icon name="close" />
    <Icon name="text/bold" />
    <Icon name="actions/delete" />
  </>
);
```

No runtime overhead, one component for all icons, native browser support, static resource instead of JS bundle, etc.

Sounds good? Of course! Native sprites are unfairly deprived technique.
Probably, you already know about it, but didn't use it because of the lack of tooling.

Here we go! Type safety, autocomplete, runtime access to icon metadata all wrapped in simple CLI:

```shell
npx @neodx/svg --group --root assets --output public/sprites --definition src/shared/ui/icon/sprite.h.ts
# --root - root folder with SVGs
# --group - group icons by folders (assets/common/add.svg -> common/add, assets/other/cut.svg -> other/cut)
# --output (-o) - output folder for sprites
# --definition (-d) - output file for sprite definitions
```

In the result, you'll get something like this:

```diff
...
src/
  shared/
    ui/
      icon/
+        sprite.h.ts // sprite definitions - types, metadata, etc.
public/
+  sprite/
+    common.svg
+    other.svg
assets/
  common/
    add.svg
    close.svg
  other/
    cut.svg
    search.svg
```

### [@neodx/log](./libs/log)

A lightweight, flexible, and isomorphic logger and logging framework designed for modern development needs.

Tired of dealing with `console.log`?
Having trouble finding a suitable logging library because they're too heavy, platform-specific, or not flexible enough?

I faced the same issues, which led me to create `@neodx/log`.
It's simple, efficient, and avoids most critical drawbacks.
Furthermore, it's easily replaceable and extensible, making it the great fit for your development needs.

<div align="center">
  <img alt="Header" src="libs/log/docs/preview-intro.png" width="1458">
</div>

- ~ 1KB gzipped in browser
- Configurable log levels and log targets
- Built-in JSON logs in production and pretty logs in development for Node.js

```typescript
import { createLogger } from '@neodx/log';
import { createWriteStream } from 'node:fs';

// Simple setup

const logger = createLogger({
  name: 'my-app',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
});

logger.debug({ login, password }, 'User logged in, session id: %s', sessionId); // Will be ignored in production
logger.warn('Retries: %i', retriesCount); // Our default levels: error, warn, info, verbose, debug

// Nested loggers

const child = logger.child('child'); // Child logger will inherit parent logger settings

child.info('Hello, world!'); // [my-app > child] Hello, world!

// Clone and extend

const forked = child.fork({ meta: { requestId } }); // Forked logger will inherit parent logger settings and extend config

forked.info({ path, method }, 'Request received'); // [my-app > child] Request received { path: '/api', method: 'GET', requestId: '...' }

// Custom log targets

const targeted = createLogger({
  name: 'my-app',
  level: 'debug',
  target: createPrettyTarget()
});
// Or you can use array notation to define multiple targets:
const withMultipleOutput = createLogger({
  target: [
    createPrettyTarget(), // Will log all levels to console
    {
      level: 'info',
      target: createJsonTarget({
        target: createWriteStream('logs/info.log')
      })
    }
  ]
});
```

### [@neodx/vfs](./libs/vfs)

Are you working on tasks or scripts that depend on the file system, such as code generation, codemods, or internal tools? Have you ever struggled to test them, needed a "dry-run" mode, or encountered other challenges?

Meet `@neodx/vfs`, the missing abstraction layer for file system operations that makes working with the file system a breeze. Let's take a look at an example:

```typescript
import { createVfs } from '@neodx/vfs';

// main.ts
const vfs = createVfs(process.cwd(), {
  dryRun: process.env.DRY_RUN === 'true'
});

await doSomethingWithVfs(vfs);
await vfs.formatChangedFiles(); // Format all changed files
await vfs.applyChanges(); // Only now changes will be applied to the real file system (if not in dry-run mode)!

// other-file.ts
async function doSomethingWithVfs(vfs: Vfs) {
  await vfs.write('file.txt', 'Hello, world!');
  // ...
  await vfs.remove('other-file.txt');
  await vfs.updateJson('manifest.json', manifest => {
    manifest.version = '1.0.0';
    return manifest;
  });
}
```

While it may seem unnecessary at first glance, let's explore the core concepts that make `@neodx/vfs` invaluable:

- Single abstraction - just share `Vfs` instance between all parts of your tool
- Inversion of control - you can provide any implementation of `Vfs` interface
  - Btw, we already have built-in support in the `createVfs` API
- Dry-run mode - you can test your tool without any side effects (only in-memory changes, read-only FS access)
- Virtual mode - you can test your tool without any real file system access, offering in-memory emulation for isolated testing
- Attached working directory - you can use clean relative paths in your logic without any additional logic
- Extensible - you can build your own features on top of `Vfs` interface
  - Currently, we have built-in support for formatting files, updating JSON files, and package.json dependencies management

In other words, it's designed as single API for all file system operations, so you can focus on your tool logic instead of reinventing the wheel.

## Development and contribution

### Internal scripts

#### Create new library

```shell
yarn neodx lib my-lib-name
```

## License

Licensed under the [MIT License](./LICENSE).
