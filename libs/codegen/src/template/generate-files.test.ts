import { join } from 'node:path';
import { createTmpTreeContext } from '../testing-utils/create-tmp-tree-context';
import { VirtualTree } from '../tree';
import { readTreeJson } from '../tree/utils/json';
import { generateFiles, injectTemplateVariables } from './generate-files';

const __dirname = new URL('.', import.meta.url).pathname;

describe('generate-files', () => {
  const treeContext = createTmpTreeContext(async () => {
    const tree = new VirtualTree('/');

    await generateFiles(tree, join(__dirname, 'fixture'), '.', {
      dot: '.',
      name: 'foo',
      value: 'bar',
      items: [1, 5, 1020]
    });
    return tree;
  });

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
    const tree = treeContext.get();

    expect(await tree.readDir()).toEqual(
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
    const tree = treeContext.get();

    expect(await readTreeJson(tree, 'template.json')).toEqual({
      foo: 'bar',
      versions: ['@1', '@5', '@1020']
    });
    expect(await tree.read('foo/foo.bar.foo.ts', 'utf-8')).toContain('export const foo = {};');
  });
});
