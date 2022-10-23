import type { Tree } from '@/tree';
import { readTreeJson, writeTreeJson } from '@/tree/utils/json';

/**
 * Add any missing dependency to package.json
 * @example
 * // before: { dependencies: { 'react': '*' } }
 * addPackageJsonDependencies(
 *    tree,
 *    'package.json',
 *    { dependencies: { 'react-dom': '*' }, devDependencies: { 'eslint': '*' } }
 * )
 * // after: { dependencies: { 'react': '*', 'react-dom': '*' }, devDependencies: { 'eslint': '*' } }
 */
export async function addPackageJsonDependencies(
  tree: Tree,
  dependencies: PackageJsonDependencies,
  path = 'package.json'
) {
  const current = await readTreeJson<PackageJsonDependencies>(tree, path);
  const dependenciesEntriesToAppend = Object.entries(dependencies)
    .map(([type, dependencies]) => [
      type,
      dependenciesFilters[type as DependencyTypeName](dependencies, current)
    ])
    .filter((entry): entry is [DependencyTypeName, DependenciesRecord] => entry[1] !== null);

  if (dependenciesEntriesToAppend.length > 0) {
    await writeTreeJson(tree, path, {
      ...current,
      ...sortObjectByKeys(
        Object.fromEntries(
          dependenciesEntriesToAppend.map(([type, appendedDependencies]) => [
            type,
            {
              ...current[type]!,
              ...appendedDependencies
            }
          ])
        )
      )
    });
    return true;
  }
  return false;
}

export async function removeTreePackageJsonDependencies(
  tree: Tree,
  dependencies: Partial<Record<DependencyTypeName, string[]>>,
  path = 'package.json'
) {
  const packageJson = await readTreeJson<PackageJsonDependencies>(tree, path);
  const dependenciesEntriesToRemove = Object.entries(dependencies).map(([type, list]) => [
    type,
    [packageJson] // list.filter(name => !packageJson[type] || !packageJson)
  ]);

  return dependenciesEntriesToRemove;
}

const sortObjectByKeys = <T extends object>(obj: T) =>
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  Object.keys(obj)
    .sort()
    .reduce(
      (result, key) => ({
        ...result,
        [key]: obj[key as keyof T]
      }),
      {}
    ) as T;

const isDependencyExists = (
  packageJson: PackageJsonDependencies,
  type: DependencyTypeName,
  name: string
) => Object.hasOwn(packageJson, type) && Object.hasOwn(packageJson[type]!, name);

const createNotFoundDependenciesFilter =
  (excluded: DependencyTypeName[]) =>
  (target: DependenciesRecord, packageJson: PackageJsonDependencies) =>
    Object.fromEntries(
      Object.entries(target).filter(([name]) =>
        excluded.every(type => !isDependencyExists(packageJson, type, name))
      )
    );

const dependenciesFilters = {
  dependencies: createNotFoundDependenciesFilter(['dependencies', 'devDependencies']),
  devDependencies: createNotFoundDependenciesFilter(['dependencies', 'devDependencies']),
  peerDependencies: createNotFoundDependenciesFilter(['dependencies', 'peerDependencies']),
  optionalDependencies: createNotFoundDependenciesFilter([
    'dependencies',
    'peerDependencies',
    'optionalDependencies'
  ])
};

type PackageJsonDependencies = Partial<Record<DependencyTypeName, Record<string, string>>>;
type DependenciesRecord = Record<string, string>;

type DependencyTypeName =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';
