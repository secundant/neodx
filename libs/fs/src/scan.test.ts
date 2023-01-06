/* eslint-disable @typescript-eslint/require-array-sort-compare */
import { resolve } from 'node:path';
import { DirResult, dirSync } from 'tmp';
import { ensureFile } from './ensure';
import { scan } from './scan';

describe('scan files', () => {
  let tmpDir: DirResult;

  beforeEach(async () => {
    tmpDir = dirSync();
    await Promise.all(
      [
        'root/file.ts',
        'root/file.test.ts',
        'root-file.ts',
        'root-file.test.ts',
        'very/deep/ignore/file.tsx',
        'very/deep/nested/file.mdx',
        'very/deep/nested/file.tsx',
        'very/deep/nested/file.test.tsx'
      ].map(name => ensureFile(resolve(tmpDir.name, name)))
    );
  });

  const cases = {
    'should find flat files': ['*.ts', ['root-file.ts', 'root-file.test.ts']],
    'should find child files': ['*/*.ts', ['root/file.ts', 'root/file.test.ts']],
    'should find deep nested files': [
      'very/**/*.{test.tsx,mdx}',
      ['very/deep/nested/file.mdx', 'very/deep/nested/file.test.tsx']
    ],
    'should exclude simple patterns': [['*.ts', '!*.test.ts'], ['root-file.ts']],
    'should support multiple patterns': [
      ['*.ts', '!*.test.ts', '**/*.tsx', '!**/*.test.tsx', '!**/ignore/**/*'],
      ['root-file.ts', 'very/deep/nested/file.tsx']
    ]
  };

  test.each(Object.entries(cases).map(([key, [params, result]]) => [key, params, result]))(
    '%s',
    async (_, params, expected) => {
      const actual = await scan(tmpDir.name, params);

      expect(actual.sort()).toEqual((expected as string[]).sort());
    }
  );
});
