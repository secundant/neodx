export {
  createInMemoryBackend,
  createInMemoryFilesRecord,
  createNodeFsBackend,
  type VfsBackend,
  type VirtualInitializer
} from './backend/index.ts';
export { createVfsContext, type CreateVfsContextParams, type VfsContext } from './core/context.ts';
export { createBaseVfs } from './core/create-base-vfs.ts';
export type {
  BaseVfs,
  VfsContentLike,
  VfsFileAction,
  VfsFileDelete,
  VfsFileMeta,
  VfsFileUpdate,
  VfsFileWrite,
  VfsLogger,
  VfsLogMethod
} from './core/types.ts';
export { type AutoVfsInput, createAutoVfs } from './create-auto-vfs.ts';
export type {
  CreateDefaultVfsBackendParams,
  CreateHeadlessVfsParams,
  CreateVfsParams,
  Vfs
} from './create-vfs.ts';
export { createDefaultVfsBackend, createHeadlessVfs, createVfs } from './create-vfs.ts';
export { createVfsPlugin, type VfsPlugin } from './create-vfs-plugin.ts';
