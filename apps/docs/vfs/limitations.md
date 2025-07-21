# Limitations

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

## `@neodx/vfs` is a limited subset of the `node:fs` functionality

`@neodx/vfs` is not a replacement or an enhancement of the `node:fs` module (like a `fs-extra`).

The main goal of `@neodx/vfs` is to provide a high-level flexible abstraction for file system operations, not to provide a full-featured file system API.

Your always can use `fs` module directly alongside with `@neodx/vfs` or [extend the VFS](./extending.md) with any custom functionality.

### No support for symlinks

Currently, symlinks are not supported because of their additional complexity.
This is a planned, but not a high-priority feature.

And, again, you can [extend the VFS](./extending.md) with symlinks support :)

### No support for renaming directories

Renaming directories is not supported due to the inability to track changes in the directory without a full scan.

In the future, we will explore introducing a new type of abstraction for directories to address this issue.

### Limited support for writing after deleting parent directory

Unfortunately, the following code will not work as expected:

```ts
async function reinitWorkingDir(vfs: Vfs) {
  // 1. Cleanup working dir
  await vfs.delete('.');
  // 2. Write some initial files
  await vfs.write('index.ts', `export const foo = 'bar';`);
}
```

Instead of the deletion of the working directory, our current implementation will "forget" about it because of child file writes.

We plan to fix this in the nearest future.
Currently, you can use the following workarounds:

```ts
// Variant A - scan and delete all files directly
async function reinitWorkingDir(vfs: Vfs) {
  // 1. Delete all files and directories
  await concurrently(await vfs.glob('**/*'), vfs.delete);
  // 2. Write some initial files
  await vfs.write('index.ts', `export const foo = 'bar';`);
}

// Variant B - use `apply` method right after the deletion
async function reinitWorkingDir(vfs: Vfs) {
  // 1. Cleanup working dir
  await vfs.delete('.');
  await vfs.apply();
  // 2. Write some initial files
  await vfs.write('index.ts', `export const foo = 'bar';`);
}
```

## No sync API

Any file system operation is asynchronous by design.
Sync API is not planned.
