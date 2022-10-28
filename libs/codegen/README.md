# @neodx/codegen

Helpers for implementing your own generation flow.

- Abstraction over file system
- Tools for generating files from templates
- Integrated helpers
  - JSON (and JSONP) parsing
  - prettier formatting
  - package.json dependencies manipulation

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
