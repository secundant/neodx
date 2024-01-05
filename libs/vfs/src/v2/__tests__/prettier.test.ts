import { describe, expect, test } from 'vitest';
import { createTmpVfs } from '../testing';

const createPreconfiguredTmpVfs = async ({ files = {} }: { files?: Record<string, string> } = {}) =>
  createTmpVfs({
    files: {
      '.prettierrc.js': `
      module.exports = {
        arrowParens: 'avoid',
        printWidth: 100,
        useTabs: false,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'none'
      }`,
      ...files
    },
    log: 'debug'
  });
describe('prettier', () => {
  test('should format all files', async () => {
    const vfs = await createPreconfiguredTmpVfs();

    await vfs.write(
      'file.js',
      `
        const  name  = 'World';
        console.log( 'Hello, ' +name  + '!' );
        function add(a, b) { return a + b
        ;;;}
        const arrow = (a, b , c) => a +
        b
        +c;
        `
    );
    await vfs.apply();
    expect(await vfs.read('file.js', 'utf-8')).toMatchInlineSnapshot(`
      "const name = 'World';
      console.log('Hello, ' + name + '!');
      function add(a, b) {
        return a + b;
      }
      const arrow = (a, b, c) => a + b + c;
      "
    `);
  });
});
