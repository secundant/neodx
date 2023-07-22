import { createColors } from '@neodx/colors';
import { fromLength } from '@neodx/std';
import { describe, expect, test } from 'vitest';
import { printCodeFrame, printPrettyError } from '../node/error';

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

  test('should print simple error', () => {
    expect(
      fixPrintedError(
        printPrettyError(new Error('foo'), {
          colors: createColors(false, true),
          filterStack: stack => !stack.file.includes('node_modules')
        })
      )
    ).toMatchInlineSnapshot(`
      "Error: foo
       » src/__tests__/errors.test.ts:LL:CC
          51|     expect(
          52|       fixPrintedError(
          53|         printPrettyError(new Error('foo'), {
            |                          ^^^^^^^^^^^^^^^^^^^
          54|           colors: createColors(false, true),
          55|           filterStack: stack => !stack.file.includes('node_modules')"
    `);
  });

  test('should print caused error', () => {
    const a = new SyntaxError('first');
    const b = new TypeError('second', { cause: a });
    const c = new Error('third', { cause: b });

    expect(
      fixPrintedError(
        printPrettyError(c, {
          colors: createColors(false, true),
          filterStack: stack => !stack.file.includes('node_modules')
        })
      )
    ).toMatchInlineSnapshot(`
      "Error: third
       » src/__tests__/errors.test.ts:LL:CC
          71|     const a = new SyntaxError('first');
          72|     const b = new TypeError('second', { cause: a });
          73|     const c = new Error('third', { cause: b });
            |               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
          74| 
          75|     expect(
       
        ↳ caused by TypeError: second
         ›   src/__tests__/errors.test.ts:LL:CC
       
          ↳ caused by SyntaxError: first
           ›     src/__tests__/errors.test.ts:LL:CC"
    `);
  });
});

const fixPrintedError = (error: string) => error.replaceAll(/(.*):\d+:\d+/g, '$1:LL:CC');
