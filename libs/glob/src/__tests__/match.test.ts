import { describe, expect, test } from 'vitest';
import { createGlobMatcher } from '../match.ts';

describe('match globs', async () => {
  test('should match simple patterns with dynamic part', () => {
    const match = createGlobMatcher('**/*.ts');

    expect(match('src/file.ts')).toBe(true);
    expect(match('src/file.test.ts')).toBe(true);
    expect(match('file.ts')).toBe(true);
    expect(match('.ts')).toBe(true);

    expect(match('src/file.js')).toBe(false);
    expect(match('src/file.tsx')).toBe(false);
    expect(match('src/file.ts.map')).toBe(false);
  });
});
