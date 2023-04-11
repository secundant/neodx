import { createVfs } from '@neodx/vfs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { generateFiles, injectTemplateVariables } from './generate-files';

const __dirname = new URL('.', import.meta.url).pathname;

describe('generate-files', () => {
  const getTestFs = async () => {
    const vfs = createVfs('/root', {
      virtual: true
    });

    await generateFiles(vfs, join(__dirname, 'fixture'), '.', {
      dot: '.',
      name: 'foo',
      value: 'bar',
      items: [1, 5, 1020]
    });
    return vfs;
  };

  test('should inject variables to file name', () => {
    expect(injectTemplateVariables('foo.txt', {})).toBe('foo.txt');
    expect(injectTemplateVariables('foo.txt.ejs', {})).toBe('foo.txt');
    expect(injectTemplateVariables('foo.txt.tmpl', {})).toBe('foo.txt');
    expect(injectTemplateVariables('foo.txt.template', {})).toBe('foo.txt');
    expect(injectTemplateVariables('[a]/[b].ts', { a: 'foo', b: 'bar' })).toBe('foo/bar.ts');
    expect(injectTemplateVariables('[a]/[b].ts.tmpl', { a: 'foo', b: 'bar' })).toBe('foo/bar.ts');
    expect(() => injectTemplateVariables('[a].ts', {})).toThrowError();
  });

  test('should add .gitignore and root files', async () => {
    const vfs = await getTestFs();

    expect(await vfs.readDir()).toEqual(
      expect.arrayContaining([
        '.gitignore',
        'raw.txt',
        '[name].[value].untouched.ts.tmpl',
        '[name].prefixed-untouched.ts.ejs',
        'template.json',
        'foo'
      ])
    );
  });

  test('should add nested file and render content template', async () => {
    const vfs = await getTestFs();

    expect(await vfs.readJson('template.json')).toEqual({
      foo: 'bar',
      versions: ['@1', '@5', '@1020']
    });
    expect(await vfs.read('foo/foo.bar.foo.ts', 'utf-8')).toContain('export const foo = {};');
  });
});
