import type { DependencyTypeName, PackageJsonDependencies } from '@neodx/pkg-misc';
import { addPackageJsonDependencies, removePackageJsonDependencies } from '@neodx/pkg-misc';
import type { BaseVFS } from '../types';
import { readVfsJson, writeVfsJson } from './json';

export async function addVfsPackageJsonDependencies(
  vfs: BaseVFS,
  deps: PackageJsonDependencies,
  name = 'package.json'
) {
  const current = await readVfsJson<PackageJsonDependencies>(vfs, name);

  return tryWrite(vfs, name, addPackageJsonDependencies(current, deps));
}

export async function removeVfsPackageJsonDependencies(
  vfs: BaseVFS,
  deps: Partial<Record<DependencyTypeName, string[]>>,
  name = 'package.json'
) {
  const current = await readVfsJson<PackageJsonDependencies>(vfs, name);

  return tryWrite(vfs, name, removePackageJsonDependencies(current, deps));
}

const tryWrite = async <T>(vfs: BaseVFS, name: string, value: T | null) => {
  if (value) {
    await writeVfsJson(vfs, name, value);
  }
  return Boolean(value);
};
