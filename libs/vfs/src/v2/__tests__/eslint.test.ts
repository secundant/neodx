import { describe, expect, test } from 'vitest';
import { createTmpVfs } from '../testing';

const createPreconfiguredTmpVfs = async ({
  rules = {},
  files = {}
}: {
  rules?: Record<string, any>;
  files?: Record<string, string>;
}) =>
  createTmpVfs({
    files: {
      '.eslintrc.js': `
      module.exports = {
        extends: ["eslint:recommended"],
        rules: ${JSON.stringify(rules)}
      }`,
      ...files
    }
  });
describe('eslint', () => {
  test('should fix all files', async () => {
    const vfs = await createPreconfiguredTmpVfs({
      rules: {
        'prefer-template': ['error'],
        'prefer-exponentiation-operator': ['error']
      }
    });

    await vfs.write(
      'file.js',
      `
        const replaceWithTemplate = "Hello, "+name+"!";
        const exponential = Math.pow(a, b);
        `
    );
    await vfs.apply();
    expect(await vfs.read('file.js', 'utf-8')).toMatchInlineSnapshot(`
      "
              const replaceWithTemplate = \`Hello, \${name}!\`;
              const exponential = a**b;
              "
    `);
  });
});
