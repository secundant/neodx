/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, test } from 'vitest';
import { cycleRef, serializeJSON } from './serialize-json';

describe('Logger > serializeJSON', () => {
  test('should work as regular serializer on regular cases', () => {
    const targets = [
      1,
      'foo',
      null,
      { value: [1, { bar: 2 }] },
      [{ foo: 1 }, { bar: [{ baz: [{ nested: { key: 1, value: [12] } }] }] }]
    ];

    for (const target of targets) {
      expect(serializeJSON(target)).toBe(JSON.stringify(target));
    }
  });

  test('should pass circular fields', () => {
    const foo = {} as any;
    const bar = { foo };
    const result = { foo, bar };

    foo.foo = foo;
    expect(serializeJSON(result)).toBe(
      `{"foo":{"foo":"${cycleRef(['foo'])}"},"bar":{"foo":{"foo":"${cycleRef(['bar', 'foo'])}"}}}`
    );
  });

  test('should pass on duplicated bu not circular fields', () => {
    const foo = {} as any;
    const bar = { foo } as any;
    const result = { foo, bar, baz: { foo, bar } };

    expect(serializeJSON(result)).toBe(
      `{"foo":{},"bar":{"foo":{}},"baz":{"foo":{},"bar":{"foo":{}}}}`
    );
  });
});
