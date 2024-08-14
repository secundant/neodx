import { includesIn, memoize } from '@neodx/std';
import { type BaseVfs, createVfsPlugin } from '@neodx/vfs';
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
    })
  };
};

export const npmVfsPlugin = () =>
  createVfsPlugin<NpmVfsPluginApi>('npm', vfs => Object.assign(vfs, createVfsNpmApi(vfs)));

const workspaceRootOnlyFiles = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'];
const packageFiles = ['package.json', ...workspaceRootOnlyFiles];

const isWorkspaceFile = includesIn(workspaceRootOnlyFiles);
const isPackageFile = includesIn(packageFiles);
