# Limitations

## `@neodx/vfs` is a limited subset of the `node:fs` functionality

`@neodx/vfs` is not a replacement or an enhancement of the `node:fs` module (like a `fs-extra`).

The main goal of `@neodx/vfs` is to provide a high-level flexible abstraction for file system operations, not to provide a full-featured file system API.

Your always can use `fs` module directly alongside with `@neodx/vfs` or [extend the VFS](./extending.md) with any custom functionality.

### No support for symlinks

Currently, symlinks are not supported because of their additional complexity.
This is a planned, but not a high-priority feature.

And, again, you can [extend the VFS](./extending.md) with symlinks support :)

## No sync API

Any file system operation is asynchronous by design.
Sync API is not planned.
