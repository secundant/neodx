# @neodx/pkg-misc

> Work in progress, for internal purposes for now

Multiple utilities for common packages tasks:

- Add/Remove dependencies
- Format with Prettier
- Check semver

## Installation

```bash
# yarn
yarn add @neodx/pkg-misc
# pnpm
pnpm add @neodx/pkg-misc
# npm
npm install @neodx/pkg-misc
```

## Usage

### addPackageJsonDependencies

```typescript
import { addPackageJsonDependencies } from '@neodx/pkg-misc';

addPackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: { a: '^1.2.0' } });
// null (no changes)
addPackageJsonDependencies(
  { dependencies: { a: '^1.2.3' } },
  { dependencies: { a: '^1.2.0', b: '^1.2.0' } }
);
// { dependencies: { a: '^1.2.3', b: '^1.2.0' } } (added b)
addPackageJsonDependencies(
  { dependencies: { a: '^1.2.3' } },
  { dependencies: { a: '^1.3.0', b: '^2.0.0' } }
);
// { dependencies: { a: '^1.3.0', b: '^2.0.0' } } (updated a, added b)
```

> WIP
