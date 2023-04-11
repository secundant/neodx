import { entries, hasOwn } from '@neodx/std';
import { coerce, gt } from 'semver';

const NON_SEMVER_PRIORITY = {
  '*': 2,
  next: 1,
  latest: 0,
  previous: -1,
  legacy: -2
};

/**
 * Check if incoming version is greater than existing version (including non-semver versions).
 * @param incoming Incoming version
 * @param existing Existing version
 * @return True if incoming version is greater than existing version
 */
export function isGreaterVersion(incoming: string, existing: string) {
  const incomingIsNotSemver = hasOwn(NON_SEMVER_PRIORITY, incoming);
  const existingIsNotSemver = hasOwn(NON_SEMVER_PRIORITY, existing);

  if (incomingIsNotSemver && existingIsNotSemver) {
    return NON_SEMVER_PRIORITY[incoming] > NON_SEMVER_PRIORITY[existing];
  }

  if (incomingIsNotSemver || existingIsNotSemver) {
    return true;
  }

  return gt(coerce(incoming)!, coerce(existing)!);
}

/**
 * Get dependencies that have been upgraded compared to current dependencies.
 * @param changes Object with dependencies to upgrade
 * @param current Object with current dependencies
 * @return Object with dependencies that have been upgraded or null if nothing has been upgraded
 * @example
 * getUpgradedDependenciesVersions(
 *  { dependencies: { a: '^1.2.3', b: '^2.0.0' } },
 *  { dependencies: { a: '^1.2.3', b: '^1.0.0' } } // b is outdated
 * );
 * // { dependencies: { b: '^2.0.0' } }
 * getUpgradedDependenciesVersions(
 * { dependencies: { a: '^1.2.3', b: '^2.0.0' } },
 * { dependencies: { a: '^1.2.3', b: '^2.0.0' } } // nothing is outdated
 * );
 * // null
 */
export function getUpgradedDependenciesVersions(
  changes: Record<string, string>,
  current: Record<string, string>
) {
  const applied = entries(changes).filter(
    ([name, version]) => hasOwn(current, name) && isGreaterVersion(version, current[name])
  );

  return applied.length > 0 ? Object.fromEntries(applied) : null;
}
