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

### [@neodx/figma](./libs/figma)

Figma is a great tool for design collaboration, but we don't have a solid way to use it in our development workflow.

Probably, you've already tried to write your own integration or use some existing solutions and faced the following problems as me:

- Multiple different not maintained packages with different APIs
- Bad documentation/usage examples or even no documentation at all
- Terrible flexibility and solution design, you just can't use it in your project because of the different document structure or workflow
- No type safety, autocomplete, etc.

In the other words, there is no really well-designed complex solution for Figma integration.

So, `@neodx/figma` is an attempt to create it. Currently, we have the following features:

- **Flexible Export CLI**: You can use it to export icons or other elements. It's a simple wrapper around our Node.JS API.
- **Typed Figma API**: All Figma API methods are typed and have autocomplete support.
- **Built-in document graph API**: Figma API is too low-level for writing any stable solution. We provide an API that allows you work with the document as a simple high-level graph of nodes.

See our examples for more details:

- [SVG sprite generation on steroids with Figma export](./examples/svg-magic-with-figma-export) - Integrated showcase of the `@neodx/svg` and `@neodx/figma` packages with real application usage!
- [Export icons from the Community Weather Icons Kit](./examples/figma-simple-export) - A simple step-by-step example of how to use the `@neodx/figma` to export icons.

We have a some ideas for future development, so stay tuned and feel free to request your own! 🚀

### [@neodx/svg](./libs/svg)

Are you converting every SVG icon to React component with SVGR or something similar? It's so ease to use!

But wait, did you know that SVG sprites are native approach for icons? It's even easier to use!

```typescript jsx
import { Icon } from '@/shared/ui';

export const MyComponent = () => (
  <>
    <Icon name="check" />
    <Icon name="close" className="text-red-500" />
    <Icon name="text/bold" className="text-lg" />
    <Icon name="actions/delete" className="p-2 rounded-md bg-stone-300" />
  </>
);
```

No runtime overhead, one component for all icons, native browser support, static resource instead of JS bundle, etc.

Sounds good? Of course! Native sprites are unfairly deprived technique.
Probably, you already know about it, but didn't use it because of the lack of tooling.

Here we go! Type safety, autocomplete, runtime access to icon metadata all wrapped in simple plugins for all popular bundlers (thx [unplugin](https://github.com/unjs/unplugin)) and CLI, for example:

<details>
  <summary>Vite plugin</summary>

```typescript
import { defineConfig } from 'vite';
import svg from '@neodx/svg/vite';

export default defineConfig({
  plugins: [
    svg({
      root: 'assets',
      output: 'public',
      definitions: 'src/shared/ui/icon/sprite.h.ts'
    })
  ]
});
```

</details>

<details>
  <summary>Webpack plugin</summary>

```typescript
import svg from '@neodx/svg/webpack';

export default {
  plugins: [
    svg({
      root: 'assets',
      output: 'public',
      definitions: 'src/shared/ui/icon/sprite.h.ts'
    })
  ]
};
```

</details>

<details>
  <summary>Rollup plugin</summary>

```typescript
import svg from '@neodx/svg/rollup';

export default {
  plugins: [
    svg({
      root: 'assets',
      output: 'public',
      definitions: 'src/shared/ui/icon/sprite.h.ts'
    })
  ]
};
```

</details>

<details>
  <summary>ESBuild plugin</summary>

```typescript
import svg from '@neodx/svg/esbuild';

export default {
  plugins: [
    svg({
      root: 'assets',
      output: 'public',
      definitions: 'src/shared/ui/icon/sprite.h.ts'
    })
  ]
};
```

</details>

<details>
  <summary>CLI</summary>

```shell
npx @neodx/svg --group --root assets --output public --definition src/shared/ui/icon/sprite.h.ts
# --root - root folder with SVGs
# --group - group icons by folders (assets/common/add.svg -> common/add, assets/other/cut.svg -> other/cut)
# --output (-o) - output folder for sprites
# --definition (-d) - output file for sprite definitions
```

</details>

<details>
<summary>Node.JS API (programmatic usage, low-level)</summary>

```typescript
import { buildSprites } from '@neodx/svg';
import { createVfs } from '@neodx/vfs';

await buildSprites({
  vfs: createVfs(process.cwd()),
  root: 'assets',
  input: '**/*.svg',
  output: 'public',
  definition: 'src/shared/ui/icon/sprite.h.ts'
});
```

</details>

For the details and real usage see our examples:

- [React, Vite, TailwindCSS, and multicolored icon](./examples/svg-vite) - A step-by-step tutorial showcasing how to integrate sprite icons into your Vite project.
- [React, Vite, icons exported by "@neodx/figma"](./examples/svg-magic-with-figma-export) - Integrated showcase of the seamless automation capabilities of `@neodx/svg` and `@neodx/figma` for your icons!
- [NextJS, webpack and simple flat icons](./examples/svg-next) - An example demonstrating the usage of `@neodx/svg` webpack plugin with NextJS.

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
