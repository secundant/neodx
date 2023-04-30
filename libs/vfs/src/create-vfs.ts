import type { ParseJsonParams, SerializeJsonParams } from '@neodx/fs';
import type { DependencyTypeName, PackageJsonDependencies } from '@neodx/pkg-misc';
import type { AbstractVfsParams } from './implementations/abstract-vfs';
import { DryRunFs } from './implementations/dry-run-fs';
import { RealFs } from './implementations/real-fs';
import { VirtualFs } from './implementations/virtual-fs';
import { readVfsJson, updateVfsJson, writeVfsJson } from './integrations/json';
import {
  addVfsPackageJsonDependencies,
  removeVfsPackageJsonDependencies
} from './integrations/package-json';
import { formatVfsChangedFiles } from './integrations/prettier';

export type VFS = ReturnType<typeof createVfs>;

export interface CreateVfsParams extends AbstractVfsParams {
  /**
   * If true, the returned VFS will be a DryRunFs (will not write anything to the disk)
   */
  dryRun?: boolean;
  /**
   * If true, the returned VFS will be a VirtualFs (emulates a file system in memory)
   */
  virtual?: boolean | Record<string, string>;
}

/**
 * Create a specific VFS implementation with common integrated helpers
 * @param root Root folder path
 * @param params VFS implementation options
 * @example
 * // DryRunFs
 * const vfs = createVfs(myRootPath, { dryRun: Boolean(process.env.DRY_RUN) });
 * // VirtualFs
 * const vfs = createVfs(myRootPath, { virtual: true });
 * // VirtualFs with initial state
 * const vfs = createVfs(myRootPath, { virtual: { "package.json": "{...}", "src/foo/bar.ts": "export const a = 1" } });
 * // RealFs (default)
 * const vfs = createVfs(myRootPath);
 * // Error: Cannot use dryRun and virtual at the same time
 * const vfs = createVfs(myRootPath, { dryRun: true, virtual: true });
 */
export function createVfs(root: string, params?: Omit<CreateVfsParams, 'root'>) {
  // TODO Probably, add support for URL (for any path-like) in root
  const vfs = createVfsImpl({ ...params, root });

  return Object.assign(vfs, {
    readJson<T>(path: string, options?: ParseJsonParams) {
      return readVfsJson<T>(vfs, path, options);
    },
    writeJson<T>(path: string, value: T, options?: SerializeJsonParams) {
      return writeVfsJson(vfs, path, value, options);
    },
    updateJson<Input, Output = Input>(
      path: string,
      updateFn: (input: Input) => Output | Promise<Output>,
      options?: ParseJsonParams & SerializeJsonParams
    ) {
      return updateVfsJson(vfs, path, updateFn, options);
    },
    formatChangedFiles() {
      return formatVfsChangedFiles(vfs);
    },
    packageJson(name = 'package.json') {
      return {
        addDependencies(dependencies: PackageJsonDependencies) {
          return addVfsPackageJsonDependencies(vfs, dependencies, name);
        },
        removeDependencies(dependencies: Partial<Record<DependencyTypeName, string[]>>) {
          return removeVfsPackageJsonDependencies(vfs, dependencies, name);
        }
      };
    }
  });
}

export function createVfsImpl({ dryRun, virtual, ...params }: CreateVfsParams) {
  if (virtual && dryRun) {
    throw new Error('Cannot use dryRun and virtual at the same time');
  }
  return virtual
    ? new VirtualFs({
        initial: virtual === true ? {} : virtual,
        ...params
      })
    : // eslint-disable-next-line unicorn/no-nested-ternary
    dryRun
    ? new DryRunFs(params)
    : new RealFs(params);
}
