import { entries, hasOwn } from '@neodx/std';
import { coerce, gt } from 'semver';

const NON_SEMVER_PRIORITY = {
  '*': 2,
  next: 1,
  latest: 0,
  previous: -1,
  legacy: -2
};

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

export function getUpgradedDependenciesVersions(
  changes: Record<string, string>,
  current: Record<string, string>
) {
  const applied = entries(changes).filter(
    ([name, version]) => hasOwn(current, name) && isGreaterVersion(version, current[name])
  );

  return applied.length > 0 ? Object.fromEntries(applied) : null;
}
