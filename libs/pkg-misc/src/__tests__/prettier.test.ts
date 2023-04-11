import { describe, expect, test } from 'vitest';
import { tryFormatPrettier } from '../prettier';

describe('prettier', () => {
  test('should format code', async () => {
    expect(await tryFormatPrettier('src/index.ts', 'const a=11,b=22;')).toEqual(
      'const a = 11,\n  b = 22;\n'
    );

    expect(
      await tryFormatPrettier('package.json', JSON.stringify({ a: 1, b: 2 }, null, 2))
    ).toEqual('{\n  "a": 1,\n  "b": 2\n}\n');

    expect(
      await tryFormatPrettier(
        new URL('../../dist/ignored.js', import.meta.url).pathname,
        'const a=11,b=22;'
      )
    ).toEqual(null);
  });
});
