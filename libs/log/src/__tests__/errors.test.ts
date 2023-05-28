import { createColors } from '@neodx/colors';
import { fromLength } from '@neodx/std';
import { describe, expect, test, vi } from 'vitest';
import { printCodeFrame } from '../error/code-frame';
import { createLogger } from '../node';

describe('errors', () => {
  test('should print simple code frame', () => {
    expect(
      printCodeFrame({
        source: ['const foo = 1;', 'const bar = 2;', 'const baz = 3;'].join('\n'),
        lineNumber: 2,
        columnNumber: 1,
        colors: createColors(false, true)
      })
    ).toMatchInlineSnapshot(`
      "  1| const foo = 1;
        2| const bar = 2;
         | ^^^^^^^^^^^^^^
        3| const baz = 3;"
    `);
  });

  test('should print deep code frame', () => {
    expect(
      printCodeFrame({
        source: [
          ...fromLength(300, () => 'doSomething(Math.random());'),
          'const foo = 1;',
          'const bar = 2;',
          'const baz = 3;'
        ].join('\n'),
        lineNumber: 301,
        columnNumber: 8,
        colors: createColors(false, true),
        indent: 4,
        overscan: 4
      })
    ).toMatchInlineSnapshot(`
      "    297| doSomething(Math.random());
          298| doSomething(Math.random());
          299| doSomething(Math.random());
          300| doSomething(Math.random());
          301| const foo = 1;
             |        ^^^^^^^
          302| const bar = 2;
          303| const baz = 3;"
    `);
  });

  test('should log error', async () => {
    const spy = vi.fn();
    const logger = createLogger({
      target: spy
    });

    logger.error('foo');
    expect(spy).toHaveBeenCalledWith({
      error: {}
    });
  });
});
