import type { PackageJsonDependencies } from '@neodx/pkg-misc';
import { addPackageJsonDependencies, removePackageJsonDependencies } from '@neodx/pkg-misc';
import { fromKeys, identity, toArray } from '@neodx/std';
import type { PackageJson } from 'pkg-types';
import { match, P } from 'ts-pattern';
import type { BaseVfs } from '../core/types';
import { createVfsPlugin } from '../create-vfs-plugin';
import type { JsonFileApi } from './json';
import { createJsonFileApi } from './json';

export interface PackageJsonPluginApi {
  packageJson(path?: string): PackageJsonApi;
}

export interface PackageJsonApi extends JsonFileApi<PackageJson> {
  addDependencies(deps: string | string[] | PackageJsonDependencies): Promise<boolean>;
  removeDependencies(deps: Record<string, string>): Promise<boolean>;
}

export function packageJson() {
  return createVfsPlugin<PackageJsonPluginApi>('packageJson', vfs => {
    vfs.packageJson = (path = 'package.json') => createVfsPackageJsonFileApi(vfs, path);
    return vfs;
  });
}

export function createVfsPackageJsonFileApi(vfs: BaseVfs, path: string): PackageJsonApi {
  const file = createJsonFileApi(vfs, path);
  const sync = async (content: unknown) => {
    if (content) await file.write(content);
    return Boolean(content);
  };

  return {
    ...file,
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
