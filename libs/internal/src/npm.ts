import { compact, includesIn, memoize, uniq } from '@neodx/std';
import { type BaseVfs, createVfsPlugin } from '@neodx/vfs';
import { createVfsPackageJsonFileApi } from '@neodx/vfs/plugins/package-json';
import { createTaskRunner } from './tasks.ts';
import { findInVfsUntil } from './vfs.ts';

export type NpmVfsPluginApi = ReturnType<typeof createVfsNpmApi>;

export const createVfsNpmApi = (vfs: BaseVfs) => {
  const createChecker = (predicate: (path: string) => boolean) => {
    const check = memoize(async (path: string) => (await vfs.readDir(path)).some(predicate));

    return async (path = '.') => await findInVfsUntil(vfs, path, check);
  };
  const { task } = createTaskRunner({ log: vfs.log.child('npm') });
  const tryFindWorkspaceRoot = task('tryFindWorkspaceRoot', createChecker(isWorkspaceFile));
  const tryFindPackageRoot = task('tryFindPackageRoot', createChecker(isPackageFile));

  return {
    tryFindWorkspaceRoot,
    tryFindPackageRoot,
    findWorkspaceRoot: task('findWorkspaceRoot', tryFindWorkspaceRoot, {
      invariant: 'Workspace root not found'
    }),
    findPackageRoot: task('findPackageRoot', tryFindPackageRoot, {
      invariant: 'Package root not found'
    }),
    // TODO Simplify this logic
    tryGetDependencyVersion: task('tryGetDependencyVersion', async (name: string) => {
      const lookupOrder = compact(uniq([await tryFindPackageRoot(), await tryFindWorkspaceRoot()]));

      // TODO Add "find until" common util
      for (const path of lookupOrder) {
        const pkg = createVfsPackageJsonFileApi(vfs, path);
        const content = await pkg.read();

        for (const field of dependencyFieldOrder) {
          if (content[field]?.[name]) {
            return content[field][name];
          }
        }
      }
      return null;
    })
  };
};

export const npmVfsPlugin = () =>
  createVfsPlugin<NpmVfsPluginApi>('npm', vfs => Object.assign(vfs, createVfsNpmApi(vfs)));

const workspaceRootOnlyFiles = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];
const packageFiles = ['package.json', ...workspaceRootOnlyFiles];
const dependencyFieldOrder = ['dependencies', 'devDependencies'];

const isWorkspaceFile = includesIn(workspaceRootOnlyFiles);
const isPackageFile = includesIn(packageFiles);
