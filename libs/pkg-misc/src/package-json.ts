import { entries, filterEntries, hasOwn, isTruthy, keys } from '@neodx/std';
import { getUpgradedDependenciesVersions } from './semver';

/**
 * Add any missing dependency to package.json content.
 * @param current Current package.json content
 * @param updates Updates to apply
 * @return Object with new content if changed and null otherwise
 * @example
 * addPackageJsonDependencies({}, { dependencies: { a: '^1.2.3' } });
 * // { dependencies: { a: '^1.2.3' } }
 * addPackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: { a: '^1.2.0' } });
 * // null
 * addPackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: { a: '^1.3.0', b: '^2.0.0' } });
 * // { dependencies: { a: '^1.3.0', b: '^2.0.0' } }
 * addPackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { devDependencies: { a: '^1.3.0', b: '^2.0.0' } });
 * // null
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
          filterEntries(
            dependencies,
            (_, name) => missed.includes(name) || Boolean(outdated?.[name])
          )
        ] as const;
      }
      return null;
    })
    .filter(isTruthy);

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

/**
 * Removes provided dependencies from package.json.
 * @param current Current package.json content
 * @param updates Specific dependencies to remove
 * @return Object with new content if changed and null otherwise
 * @example
 * removePackageJsonDependencies({}, { dependencies: ['a'] });
 * // null
 * removePackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: ['a'] });
 * // { dependencies: {} }
 * removePackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: ['b'] });
 * // null
 * removePackageJsonDependencies({ dependencies: { a: '^1.2.3' } }, { dependencies: ['a', 'b'] });
 */
export function removePackageJsonDependencies(
  current: PackageJsonDependencies,
  updates: Partial<Record<DependencyTypeName, string[]>>
) {
  const affected = entries(updates)
    .map(([type, names]) => {
      const removing = names.filter(name => hasOwn(current[type] ?? {}, name));

      return removing.length > 0 ? ([type, removing] as const) : null;
    })
    .filter(isTruthy);

  if (affected.length > 0) {
    return sortPackageJson({
      ...current,
      ...Object.fromEntries(
        affected.map(([type, removing]) => [
          type,
          filterEntries(current[type]!, (_, name) => !removing.includes(name))
        ])
      )
    });
  }
  return null;
}

export function sortPackageJson<T extends PackageJsonDependencies>(value: T) {
  const next = {
    ...value
  };

  for (const type of dependenciesTypes) {
    if (!hasOwn(next, type)) continue;
    if (keys(next[type]).length === 0) {
      delete next[type];
    } else {
      next[type] = sortObjectByKeys(next[type]);
    }
  }

  return sortObjectByKeys(next);
}

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
    lookupPriority.every(type => !hasOwn(currentPackageJsonDeps[type] ?? {}, name))
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
