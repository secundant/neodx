import { fromLength, sum } from '@neodx/std';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import {
  createTmpTree,
  createTmpTreeContext,
  writeFilesFromVirtualTreeSource
} from '../testing-utils/create-tmp-tree-context';
import { addPackageToTree } from '../testing-utils/package';
import { FsTree } from './impl/fs-tree';
import { ReadonlyVirtualFsTree } from './impl/readonly-virtual-fs-tree';
import { VirtualTree } from './impl/virtual-tree';
import { ContentLike, FileChangeType, Tree } from './types';
import { readTreeJson, writeTreeJson } from './utils/json';
import { formatAllChangedFilesInTree } from './utils/prettier';

describe('Tree', () => {
  describe.each([
    {
      name: 'Simple VirtualTree',
      factory: createSimpleVirtualTree
    },
    {
      name: 'Simple FsTree',
      factory: () => createFsTree(() => createTmpTree(FsTree))
    },
    {
      name: 'Simple ReadonlyFsTree',
      factory: () => createFsTree(() => createTmpTree(ReadonlyVirtualFsTree))
    }
  ])(`$name`, ({ factory }) => {
    const tree = createTmpTreeContext(factory);

    test('should have initial state', async () => {
      const fs = tree.get();

      expect(await fs.getChanges()).toEqual([]);
      expectArrayEq(await fs.readDir(), ['root-file.ts', 'parent']);
    });

    test('should read files and throw on unknown', async () => {
      const fs = tree.get();

      expect(await fs.read('root-file.ts')).toEqual(Buffer.from('root content'));
      expect(await fs.read('root-file.ts', 'utf-8')).toEqual('root content');

      await expect(fs.read('unknown')).rejects.toBeInstanceOf(Error);
      expect(await fs.tryRead('unknown')).toBe(null);
    });

    test('should create file', async () => {
      const fs = tree.get();

      await fs.write('new.ts', 'code');

      expect(await fs.read('new.ts', 'utf-8')).toBe('code');
      expect(await fs.getChanges()).toEqual([change('new.ts', FileChangeType.CREATE, 'code')]);
    });

    test('should change one file and create other', async () => {
      const fs = tree.get();

      expectArrayEq(await fs.readDir('parent'), ['child', 'parent-file.ts']);

      await fs.write('parent/new-file.ts', 'code');
      await fs.write('parent/parent-file.ts', Buffer.from('next'));

      expectArrayEq(await fs.readDir('parent'), ['child', 'parent-file.ts', 'new-file.ts']);
      expect(await fs.getChanges()).toEqual([
        change('parent/new-file.ts', FileChangeType.CREATE, 'code'),
        change('parent/parent-file.ts', FileChangeType.UPDATE, 'next')
      ]);
    });

    test('should ignore equal changes', async () => {
      const fs = tree.get();

      await fs.write('/parent/parent-file.ts', 'new content');
      await fs.delete('root-file.ts');
      await fs.rename('/parent/child/child-file.ts', '/another-dir/file.ts');

      // Rename === write + delete
      expect(await fs.getChanges()).toHaveLength(4);
      expectArrayEq(await fs.readDir(), ['parent', 'another-dir']);

      await fs.write('root-file.ts', Buffer.from('root content'));
      await fs.write('/parent/parent-file.ts', 'parent content');

      // Instead of rename
      await fs.delete('/another-dir/file.ts');
      await fs.write('/parent/child/child-file.ts', 'child content');

      expect(await fs.getChanges()).toHaveLength(0);
    });

    test('should remove dirs files', async () => {
      const fs = tree.get();

      await fs.write('parent/child-2/file.ts', 'new child content');
      await fs.delete('./parent/child-2');
      await fs.delete('./parent/child');

      expectArrayEq(await fs.readDir('parent'), ['parent-file.ts']);
      expect(await fs.getChanges()).toEqual([change('parent/child', FileChangeType.DELETE, null)]);
    });

    test('should return valid exists/isFile even before applies', async () => {
      const fs = tree.get();

      expect(await fs.exists('unknown')).toBe(false);
      expect(await fs.isFile('unknown/file.ts')).toBe(false);

      await fs.write('unknown/file.ts', 'content');

      expect(await fs.exists('unknown')).toBe(true);
      expect(await fs.isFile('unknown')).toBe(false);
      expect(await fs.isFile('unknown/file.ts')).toBe(true);

      await fs.delete('unknown/file.ts');
      expect(await fs.exists('unknown')).toBe(false);
      expect(await fs.isFile('unknown')).toBe(false);
      expect(await fs.isFile('unknown/file.ts')).toBe(false);
      expect(await fs.getChanges()).toEqual([]);
    });
  });

  describe('FsTree', () => {
    const tree = createTmpTreeContext(() =>
      writeFilesFromVirtualTreeSource(createTmpTree(FsTree), createSimpleVirtualTree())
    );
    const nestedDirsFilesCount = [
      {
        files: 100
      },
      {
        files: 120
      },
      {
        files: 40
      },
      {
        files: 140
      }
    ];
    const nestedMessage = `${sum(nestedDirsFilesCount.map(item => item.files))} files in ${
      nestedDirsFilesCount.length
    } dirs`;

    test(`should handle huge amount of changes (${nestedMessage})`, async () => {
      const fs = tree.get();

      await fs.delete('parent');
      await fs.delete('root-file.ts');
      await fs.applyChanges();
      expect(await fs.readDir()).toEqual([]);

      /**
       * TODO Create nested files tree
       */
      for (const [index, { files }] of nestedDirsFilesCount.entries()) {
        const baseDirName = fromLength(index, i => `dir-${i}`).join('/');

        for (const fileIndex of fromLength(files)) {
          await fs.write(
            join(baseDirName, `file-${fileIndex}.txt`),
            `content of file #${fileIndex}`
          );
        }
      }
      await fs.applyChanges();
      for (const [index, { files }] of nestedDirsFilesCount.entries()) {
        const baseDirName = fromLength(index, i => `dir-${i}`).join('/');
        const expectedMembers = [...fromLength(files, fileIndex => `file-${fileIndex}.txt`)].concat(
          index < nestedDirsFilesCount.length - 1 ? `dir-${index}` : []
        );
        const actualMembers = await fs.readDir(baseDirName);

        expectArrayEq(actualMembers, expectedMembers);
      }
    });
  });

  describe(`Integrated utils`, () => {
    const tree = createTmpTreeContext(() =>
      writeFilesFromVirtualTreeSource(createTmpTree(FsTree), createSimpleVirtualTree())
    );
    const packageTree = createTmpTreeContext(() => addPackageToTree(createTmpTree()));

    test('should read and write json', async () => {
      const fs = tree.get();
      const json = { a: 1, b: '2', c: null, d: { e: [3] } };

      await writeTreeJson(fs, 'foo.json', json);
      expect(await readTreeJson(fs, 'foo.json')).toEqual(json);

      await fs.applyChanges();
      expect(await readTreeJson(fs, 'foo.json')).toEqual(json);
    });

    test('should apply prettier', async () => {
      const fs = packageTree.get();

      await fs.write(
        'src/file.json',
        '{ "a": 1,"b":  [2, 3,4], "very_long_key_for_force_new_line_on_prettier_format":{"d":{"e":5}}}'
      );
      await fs.write('src/index.ts', 'export const a =1');
      await fs.write('src/ignored.ejs', '<%=foo% > ___');
      await formatAllChangedFilesInTree(fs);
      expect(await fs.read('src/file.json', 'utf-8')).toBe(
        `{
  "a": 1,
  "b": [2, 3, 4],
  "very_long_key_for_force_new_line_on_prettier_format": { "d": { "e": 5 } }
}
`
      );
      expect(await fs.read('src/index.ts', 'utf-8')).toBe(`export const a = 1;
`);
      expect(await fs.read('src/ignored.ejs', 'utf-8')).toBe('<%=foo% > ___');
    });
  });
});

function createFsTree(factory: () => Tree) {
  return writeFilesFromVirtualTreeSource(factory(), createSimpleVirtualTree());
}

function createSimpleVirtualTree() {
  return new VirtualTree('/', {
    'root-file.ts': 'root content',
    'parent/parent-file.ts': 'parent content',
    'parent/child/child-file.ts': 'child content'
  });
}

// eslint-disable-next-line @typescript-eslint/require-array-sort-compare
const expectArrayEq = <T>(left: T[], right: T[]) => expect(left.sort()).toEqual(right.sort());
const change = (name: string, type: FileChangeType, content: ContentLike | null) => ({
  name,
  type,
  content: content ? Buffer.from(content) : content
});
