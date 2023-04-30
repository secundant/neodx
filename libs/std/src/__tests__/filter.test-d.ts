import { expectTypeOf, test } from 'vitest';
import { compactObject } from '../object';

test('should compact object', () => {
  expectTypeOf(compactObject({ foo: 1, bar: '' } as const)).toEqualTypeOf<{
    foo: 1;
  }>();
  expectTypeOf(
    compactObject({ a: 1, b: false, c: null, d: undefined, e: '', f: 'str', zero: 0 } as const)
  ).toEqualTypeOf<{
    a: 1;
    f: 'str';
  }>();
});
