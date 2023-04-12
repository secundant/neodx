import { describe, expect, test } from 'vitest';
import { getHash } from '../hash';

describe('hash', () => {
  test('should be strict', () => {
    expect(getHash('foo-bar')).toMatchInlineSnapshot(
      '"7d89c4f517e3bd4b5e8e76687937005b602ea00c5cba3e25ef1fc6575a55103e"'
    );
    expect(getHash(Buffer.from('foo-bar'))).toMatchInlineSnapshot(
      '"7d89c4f517e3bd4b5e8e76687937005b602ea00c5cba3e25ef1fc6575a55103e"'
    );
    expect(getHash('foo-bar-baz')).toBe(getHash('foo-bar-baz'));
    expect(getHash('foo-bar-baz')).toBe(getHash(Buffer.from('foo-bar-baz')));
  });
});
