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
 * Check if `incoming` is a greater version than `existing`, with limited support for non-semver
 * dist-tags (`*`, `next`, `latest`, `previous`, `legacy`) ranked in that order.
 *
 * Rules, in order:
 * - both non-semver → compare by the fixed tag priority;
 * - exactly one non-semver → `true` (a tag is treated as newer than a pinned semver, and vice
 *   versa, so any tag/semver mix is considered an upgrade);
 * - both semver → coerce and compare with `>`.
 *
 * @param incoming Incoming version (semver or one of the known dist-tags)
 * @param existing Existing version (semver or one of the known dist-tags)
 * @return `true` if `incoming` is greater than `existing` per the rules above
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
 * Compare two flat name → version maps and keep only the entries where `changes` is a real upgrade
 * over `current` (per `isGreaterVersion`). Operates on a single dependency group (e.g. one of
 * `dependencies` / `devDependencies`), not on a full `PackageJsonDependencies` object.
 * @param changes Incoming name → version map (candidates to apply)
 * @param current Existing name → version map (baseline to compare against)
 * @return Name → version map of upgraded entries, or `null` if nothing is a real upgrade
 * @example
 * getUpgradedDependenciesVersions({ a: '^1.2.3', b: '^2.0.0' }, { a: '^1.2.3', b: '^1.0.0' });
 * // { b: '^2.0.0' }
 * getUpgradedDependenciesVersions({ a: '^1.2.3', b: '^2.0.0' }, { a: '^1.2.3', b: '^2.0.0' });
 * // null
 */
export function getUpgradedDependenciesVersions(
  changes: Record<string, string>,
  current: Record<string, string>
) {
  const applied = entries(changes).filter(
    ([name, version]) => hasOwn(current, name) && isGreaterVersion(version, current[name]!)
  );

  return applied.length > 0 ? Object.fromEntries(applied) : null;
}
