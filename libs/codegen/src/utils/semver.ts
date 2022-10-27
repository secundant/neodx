import { coerce, gt } from 'semver';
import { entries, has } from '@/utils/core';

const NON_SEMVER_PRIORITY = {
  '*': 2,
  next: 1,
  latest: 0,
  previous: -1,
  legacy: -2
};

export function isGreaterVersion(incoming: string, existing: string) {
  const incomingIsNotSemver = has(NON_SEMVER_PRIORITY, incoming);
  const existingIsNotSemver = has(NON_SEMVER_PRIORITY, existing);

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
    ([name, version]) => has(current, name) && isGreaterVersion(version, current[name])
  );

  return applied.length > 0 ? Object.fromEntries(applied) : null;
}
