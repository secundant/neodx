import { describe, expect, test } from 'vitest';
import { createTmpVfs } from '../testing';

const createPreconfiguredTmpVfs = async ({
  rules = {},
  files = {},
  prettier
}: {
  rules?: Record<string, any>;
  files?: Record<string, string>;
  prettier?: boolean;
}) =>
  createTmpVfs({
    files: Object.assign(
      files,
      {
        'package-lock.json': JSON.stringify({}),
        'package.json': JSON.stringify({
          name: 'test',
          version: '1.0.0',
          devDependencies: {
            eslint: 'latest'
          }
        }),
        '.eslintrc.js': `
      module.exports = {
        extends: ["eslint:recommended"],
        rules: ${JSON.stringify(rules)}
      }`
      },
      prettier && {
        '.prettierrc.js': `
      module.exports = {
        arrowParens: 'avoid',
        printWidth: 100,
        useTabs: false,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        trailingComma: 'none'
      }`
      }
    )
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
        const replaceWithTemplate =    "Hello, "+name+"!";



        const exponential = Math.pow(a, b);
        `
    );
    await vfs.apply();
    expect(await vfs.read('file.js', 'utf-8')).toMatchInlineSnapshot(`
      "
              const replaceWithTemplate =    \`Hello, \${name}!\`;



              const exponential = a**b;
              "
    `);
  });

  test('should work with prettier', async () => {
    const vfs = await createPreconfiguredTmpVfs({
      rules: {
        'prefer-template': ['error'],
        'prefer-exponentiation-operator': ['error']
      },
      prettier: true
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
      "const replaceWithTemplate = \`Hello, \${name}!\`;

      const exponential = a ** b;
      "
    `);
  });
});
