import { entries, filterRecord, has, isNotFalsy, keys } from '@/utils/core';
import { getUpgradedDependenciesVersions } from '@/utils/semver';

/**
 * Add any missing dependency to package.json content.
 * @return Object with new content if changed and null otherwise
 * @example
 * // before: { dependencies: { 'react': '*' } }
 * addPackageJsonDependencies(
 *    await readJsonFile('./package.json'), // { ..., dependencies: { 'react': '*' } }
 *    { dependencies: { 'react-dom': '*' }, devDependencies: { 'eslint': '*' } }
 * )
 * // after: { dependencies: { 'react': '*', 'react-dom': '*' }, devDependencies: { 'eslint': '*' } }
 */
export function addPackageJsonDependencies(
  current: PackageJsonDependencies,
  updates: PackageJsonDependencies
) {
  const affected = entries(updates)
    .map(([type, dependencies]) => {
      const missed = lookupMissedDependencies(type, keys(dependencies), current);
      const outdated = lookupOutdatedDependencies(dependencies, current[type] ?? null);

      if (missed.length > 0 || outdated) {
        return [
          type,
          filterRecord(
            dependencies,
            (_, name) => missed.includes(name) || Boolean(outdated?.[name])
          )
        ] as const;
      }
      return null;
    })
    .filter(isNotFalsy);

  if (affected.length > 0) {
    return sortPackageJson({
      ...current,
      ...Object.fromEntries(
        affected.map(([type, dependencies]) => [
          type,
          {
            ...current[type]!,
            ...dependencies
          }
        ])
      )
    });
  }
  return null;
}

export function removePackageJsonDependencies(
  current: PackageJsonDependencies,
  updates: Partial<Record<DependencyTypeName, string[]>>
) {
  const affected = entries(updates)
    .map(([type, names]) => {
      const removing = names.filter(name => has(current[type] ?? {}, name));

      return removing.length > 0 ? ([type, removing] as const) : null;
    })
    .filter(isNotFalsy);

  if (affected.length > 0) {
    return sortPackageJson({
      ...current,
      ...Object.fromEntries(
        affected.map(([type, removing]) => [
          type,
          filterRecord(current[type]!, (_, name) => !removing.includes(name))
        ])
      )
    });
  }
  return null;
}

const sortPackageJson = <T extends PackageJsonDependencies>(value: T) => {
  const next = {
    ...value
  };

  for (const type of dependenciesTypes) {
    if (!has(next, type)) continue;
    if (keys(next[type]).length === 0) {
      delete next[type];
    } else {
      next[type] = sortObjectByKeys(next[type]);
    }
  }

  return sortObjectByKeys(next);
};

const sortObjectByKeys = <T extends Record<keyof any, unknown>>(obj: T) =>
  Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
    keys(obj)
      .sort()
      .map(key => [key, obj[key]])
  ) as T;

function lookupOutdatedDependencies(
  incomingDependencies: Record<string, string>,
  existingDependencies: Record<string, string> | null
) {
  return existingDependencies
    ? getUpgradedDependenciesVersions(incomingDependencies, existingDependencies)
    : null;
}

function lookupMissedDependencies(
  dependenciesType: DependencyTypeName,
  dependenciesNames: string[],
  currentPackageJsonDeps: PackageJsonDependencies
) {
  const lookupPriority = dependenciesLookupPriority[dependenciesType];

  return dependenciesNames.filter(name =>
    lookupPriority.every(type => !has(currentPackageJsonDeps[type] ?? {}, name))
  );
}

const dependenciesLookupPriority: Record<DependencyTypeName, DependencyTypeName[]> = {
  dependencies: ['dependencies', 'devDependencies'],
  devDependencies: ['devDependencies', 'dependencies'],
  peerDependencies: ['peerDependencies', 'dependencies'],
  optionalDependencies: ['optionalDependencies', 'dependencies', 'peerDependencies']
};
const dependenciesTypes = keys(dependenciesLookupPriority);

export type PackageJsonDependencies = Partial<Record<DependencyTypeName, Record<string, string>>>;
export type DependencyTypeName =
  | 'dependencies'
  | 'devDependencies'
  | 'peerDependencies'
  | 'optionalDependencies';
