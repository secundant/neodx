# @neodx/codegen

Helpers for implementing your own generation flow.

- Abstraction over file system
- Tools for generating files from templates
- Integrated helpers
  - JSON (and JSONP) parsing
  - prettier formatting
  - package.json dependencies manipulation

## Contents

### Tree - file system abstraction

```typescript
import {
  type Tree, // Interface
  FsTree, // Tree over native FS
  VirtualTree, // Empty in-memory tree. Useful for testing / dry-run / emulation
  ReadonlyVirtualFsTree // Mixed behavior: read initial state from real fs, but keep all changes in memory
} from '@neodx/codegen';

// test.ts
const tree = new FsTree(__dirname);

await tree.readDir(); // ['test.ts']
await tree.delete('test.ts');
await tree.readDir(); // []
await tree.applyChanges();
```

Collects all files updates until you apply it to real FS.

Why we need this abstraction if we can just write everything directly in fs?

1. Single source of changes - we always know our context: path, current state, list of changes
2. Apply changes only when we know what everything is ok
3. Store updates - prevent unnecessary changes, maybe change something in only changed files

#### Example of that behavior

```typescript
import { FsTree, Tree } from '@neodx/codegen';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const path = join(__dirname, 'test');
const tree = new FsTree(path);

console.log(await readdir(path)); // []
await tree.write('new.txt', 'content');
console.log(await readdir(path)); // []
console.log(await tree.readDir()); // ['new.txt']
await tree.applyChanges();
console.log(await readdir(path)); // ['new.txt']
console.log(await tree.readDir()); // ['new.txt']
```

### Tree integrated helpers

```typescript
import {
  Tree,
  readTreeJson,
  updateTreeJson,
  writeTreeJson,
  addTreePackageJsonDependencies,
  removeTreePackageJsonDependencies,
  formatAllChangedFilesInTree
} from '@neodx/codegen';

async function runExample(tree: Tree) {
  await readTreeJson(tree, 'manifest.json'); // {}
  await writeTreeJson(tree, 'manifest.json', { count: 0 });
  await updateTreeJson(tree, 'manifest.json', prev => ({ ...prev, count: prev.count + 1 }));
  await readTreeJson(tree, 'manifest.json'); // { count: 1 }
  await addTreePackageJsonDependencies(tree, {
    dependencies: {
      foo: '^3.0.0'
    },
    devDependencies: {
      bar: '*'
    },
    peerDependencies: {
      bar: '^1.2.3'
    }
  });
  await removeTreePackageJsonDependencies(tree, {
    devDependencies: ['one'],
    dependencies: ['two']
  });
  await formatAllChangedFilesInTree(tree);
}
```

### Template engine

> TODO

## Examples

### Update TypeScript paths in monorepo

```typescript
import { type Tree, FsTree, updateTreeJson, formatAllChangedFilesInTree } from '@neodx/codegen';

async function addTsConfigPath(tree: Tree, name: string) {
  await updateTreeJson(tree, 'tsconfig.base.json', prev => ({
    ...prev,
    compilerOptions: {
      ...prev.compilerOptions,
      paths: {
        ...prev.compilerOptions.paths,
        [`@my-org/${name}`]: [`./libs/${name}/src/index.ts`],
        [`@my-org/${name}/*`]: [`./libs/${name}/src/*`]
      }
    }
  }));
}

const tree = new FsTree(process.cwd());

// ...some logic...
await addTsConfigPath(tree, 'foo');
// ...some logic...
await addTsConfigPath(tree, 'bar');
// ...some logic...
// Finally - format and save changes
await formatAllChangedFilesInTree(tree);
await tree.applyChanges();
```
