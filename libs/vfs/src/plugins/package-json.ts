import type { PackageJsonDependencies } from '@neodx/pkg-misc';
import { addPackageJsonDependencies, removePackageJsonDependencies } from '@neodx/pkg-misc';
import { fromKeys, hasOwn, identity, toArray } from '@neodx/std';
import type { PackageJson } from 'pkg-types';
import { match, P } from 'ts-pattern';
import type { BaseVfs } from '../core/types';
import { createVfsPlugin } from '../create-vfs-plugin';
import { createJsonFileApi } from './json';

export interface PackageJsonPluginApi {
  packageJson(path?: string): PackageJsonApi;
}

export type PackageJsonApi = ReturnType<typeof createVfsPackageJsonFileApi>;

export function packageJson() {
  return createVfsPlugin<PackageJsonPluginApi>('packageJson', vfs => {
    vfs.packageJson = (path = 'package.json') => createVfsPackageJsonFileApi(vfs, path);
    return vfs;
  });
}

export function createVfsPackageJsonFileApi(vfs: BaseVfs, path: string) {
  const file = createJsonFileApi<PackageJson>(vfs, path);
  const sync = async (content: unknown) => {
    if (content) await file.write(content);
    return Boolean(content);
  };

  return {
    ...file,
    async hasDependency(name: string) {
      const pkg = await file.read<PackageJson>();

      return allDeps.some(type => hasOwn(pkg[type] ?? {}, name));
    },
    async addDependencies(deps: string | string[] | PackageJsonDependencies) {
      return sync(
        addPackageJsonDependencies(
          await file.read(),
          match(deps)
            .with(stringOrArray, name => ({
              dependencies: fromKeys(toArray(name), () => '*')
            }))
            .with(P._, identity)
            .exhaustive()
        )
      );
    },
    async removeDependencies(deps: string | string[] | Record<string, string>) {
      return sync(
        removePackageJsonDependencies(
          await file.read(),
          match(deps)
            .with(stringOrArray, name => fromKeys(allDeps, () => toArray(name)))
            .with(P._, identity)
            .exhaustive()
        )
      );
    }
  };
}

const stringOrArray = P.string.or(P.array(P.string));
const allDeps = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
