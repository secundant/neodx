import { resolve } from 'node:path';
import { type DirResult, dirSync } from 'tmp';
import { beforeEach, describe, expect, test } from 'vitest';
import { ensureFile } from '../ensure';
import { deepReadDir } from '../read';

const TMP_FILES = ['a.ts', 'a/b.ts'];

describe('read', () => {
  let tmpDir: DirResult;

  beforeEach(async () => {
    tmpDir = dirSync();
    await Promise.all(TMP_FILES.map(name => ensureFile(resolve(tmpDir.name, name))));
  });

  test('should return absolute paths by default', async () => {
    expectArrayEq(
      await deepReadDir(tmpDir.name),
      TMP_FILES.map(name => resolve(tmpDir.name, name))
    );
  });

  test('should return relative paths with flag', async () => {
    expectArrayEq(await deepReadDir(tmpDir.name, { absolute: false }), TMP_FILES);
  });
});

// TODO Make shared util
const expectArrayEq = <T>(left: T[], right: T[]) =>
  // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
  expect(Array.from(left).sort()).toEqual(Array.from(right).sort());
