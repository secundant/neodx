import type { Tree } from '@/tree';
import { readTreeJson, writeTreeJson } from '@/tree/utils/json';
import type { DependencyTypeName, PackageJsonDependencies } from '@/utils/package-json';
import { addPackageJsonDependencies, removePackageJsonDependencies } from '@/utils/package-json';

export async function addTreePackageJsonDependencies(
  tree: Tree,
  deps: PackageJsonDependencies,
  name = 'package.json'
) {
  const current = await readTreeJson(tree, name);

  return tryWrite(tree, name, addPackageJsonDependencies(current, deps));
}

export async function removeTreePackageJsonDependencies(
  tree: Tree,
  deps: Partial<Record<DependencyTypeName, string[]>>,
  name = 'package.json'
) {
  const current = await readTreeJson(tree, name);

  return tryWrite(tree, name, removePackageJsonDependencies(current, deps));
}

const tryWrite = async <T>(tree: Tree, name: string, value: T | null) => {
  if (value) {
    await writeTreeJson(tree, name, value);
  }
  return Boolean(value);
};
