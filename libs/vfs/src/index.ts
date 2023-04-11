export type { CreateVfsParams, VFS } from './create-vfs';
export { createVfs } from './create-vfs';
export { DryRunFs } from './implementations/dry-run-fs';
export { RealFs } from './implementations/real-fs';
export { VirtualFs } from './implementations/virtual-fs';
export { readVfsJson, updateVfsJson, writeVfsJson } from './integrations/json';
export {
  addVfsPackageJsonDependencies,
  removeVfsPackageJsonDependencies
} from './integrations/package-json';
export { formatVfsChangedFiles } from './integrations/prettier';
export type { BaseVFS, ContentLike, FileChange, FileDelete, FileWrite } from './types';
export { FileChangeType } from './types';
