import { createLogger } from '@neodx/log';
import { createPrettyTarget } from '@neodx/log/node';
import { fromLength, sum } from '@neodx/std';
import { join } from 'pathe';
import { describe, expect, test } from 'vitest';
import { VirtualFs } from '../implementations/virtual-fs';
import { createTmpVfs, writeVfsPackageConfiguration, writeVirtualFs } from '../testing-utils';
import { type ContentLike, FileChangeType } from '../types';

const log = createLogger({
  level: 'silent',
  target: createPrettyTarget({
    displayLevel: false
  })
});

describe('Tree', () => {
  describe.each([
    {
      name: 'VirtualFs',
      factory: createTmpVirtualFs
    },
    {
      name: 'RealFs',
      async factory() {
        const vfs = await createTmpVfs({ dryRun: false, log });

        await writeVirtualFs(vfs.root, tmpVfs);
        return vfs;
      }
    },
    {
      name: 'DtyRunFs',
      async factory() {
        const vfs = await createTmpVfs({ dryRun: true, log });

        await writeVirtualFs(vfs.root, tmpVfs);
        return vfs;
      }
    }
  ])(`Common cases - $name`, ({ factory }) => {
    test('should have initial state', async () => {
      const vfs = await factory();

      expect(await vfs.getChanges()).toEqual([]);
      expectArrayEq(await vfs.readDir(), ['root-file.ts', 'parent']);
    });

    test('should read files and throw on unknown', async () => {
      const vfs = await factory();

      expect(await vfs.read('root-file.ts')).toEqual(Buffer.from('root content'));
      expect(await vfs.read('root-file.ts', 'utf-8')).toEqual('root content');

      await expect(vfs.read('unknown')).rejects.toBeInstanceOf(Error);
      expect(await vfs.tryRead('unknown')).toBe(null);
    });

    test('should create file', async () => {
      const vfs = await factory();

      await vfs.write('new.ts', 'code');

      expect(await vfs.read('new.ts', 'utf-8')).toBe('code');
      expect(await vfs.getChanges()).toEqual([change('new.ts', FileChangeType.CREATE, 'code')]);
    });

    test('should change one file and create other', async () => {
      const vfs = await factory();

      expectArrayEq(await vfs.readDir('parent'), ['child', 'parent-file.ts']);

      await vfs.write('parent/new-file.ts', 'code');
      await vfs.write('parent/parent-file.ts', Buffer.from('next'));

      expectArrayEq(await vfs.readDir('parent'), ['child', 'parent-file.ts', 'new-file.ts']);
      expect(await vfs.getChanges()).toEqual([
        change('parent/new-file.ts', FileChangeType.CREATE, 'code'),
        change('parent/parent-file.ts', FileChangeType.UPDATE, 'next')
      ]);
    });

    test('should ignore equal changes', async () => {
      const vfs = await factory();

      await vfs.write('/parent/parent-file.ts', 'new content');
      await vfs.delete('root-file.ts');
      await vfs.rename('/parent/child/child-file.ts', '/another-dir/file.ts');

      // Rename === write + delete
      expect(await vfs.getChanges()).toHaveLength(4);
      expectArrayEq(await vfs.readDir(), ['parent', 'another-dir']);

      await vfs.write('root-file.ts', Buffer.from('root content'));
      await vfs.write('/parent/parent-file.ts', 'parent content');

      // Instead of rename
      await vfs.delete('/another-dir/file.ts');
      await vfs.write('/parent/child/child-file.ts', 'child content');

      expect(await vfs.getChanges()).toHaveLength(0);
    });

    test('should remove dirs files', async () => {
      const vfs = await factory();

      await vfs.write('parent/child-2/file.ts', 'new child content');
      await vfs.delete('./parent/child-2');
      await vfs.delete('./parent/child');

      expectArrayEq(await vfs.readDir('parent'), ['parent-file.ts']);
      expect(await vfs.getChanges()).toEqual([change('parent/child', FileChangeType.DELETE, null)]);
    });

    test('should return valid exists/isFile even before applies', async () => {
      const vfs = await factory();

      expect(await vfs.exists('unknown')).toBe(false);
      expect(await vfs.isFile('unknown/file.ts')).toBe(false);

      await vfs.write('unknown/file.ts', 'content');

      expect(await vfs.exists('unknown')).toBe(true);
      expect(await vfs.isFile('unknown')).toBe(false);
      expect(await vfs.isFile('unknown/file.ts')).toBe(true);

      await vfs.delete('unknown/file.ts');
      expect(await vfs.exists('unknown')).toBe(false);
      expect(await vfs.isFile('unknown')).toBe(false);
      expect(await vfs.isFile('unknown/file.ts')).toBe(false);
      expect(await vfs.getChanges()).toEqual([]);
    });
  });

  describe('FsTree', async () => {
    const vfs = createTmpVfs({ log });
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

    await writeVirtualFs(vfs.root, tmpVfs);

    test(`should handle huge amount of changes (${nestedMessage})`, async () => {
      await vfs.delete('parent');
      await vfs.delete('root-file.ts');
      await vfs.applyChanges();
      expect(await vfs.readDir()).toEqual([]);

      /**
       * TODO Create nested files tree
       */
      for (const [index, { files }] of nestedDirsFilesCount.entries()) {
        const baseDirName = fromLength(index, i => `dir-${i}`).join('/');

        for (const fileIndex of fromLength(files)) {
          await vfs.write(
            join(baseDirName, `file-${fileIndex}.txt`),
            `content of file #${fileIndex}`
          );
        }
      }
      await vfs.applyChanges();
      for (const [index, { files }] of nestedDirsFilesCount.entries()) {
        const baseDirName = fromLength(index, i => `dir-${i}`).join('/');
        const expectedMembers = [...fromLength(files, fileIndex => `file-${fileIndex}.txt`)].concat(
          index < nestedDirsFilesCount.length - 1 ? `dir-${index}` : []
        );
        const actualMembers = await vfs.readDir(baseDirName);

        expectArrayEq(actualMembers, expectedMembers);
      }
    });
  });

  describe(`Integrated utils`, async () => {
    test('should read and write json', async () => {
      const vfs = createTmpVfs({ log });
      const json = { a: 1, b: '2', c: null, d: { e: [3] } };

      await vfs.writeJson('foo.json', json);
      expect(await vfs.readJson('foo.json')).toEqual(json);

      await vfs.applyChanges();
      expect(await vfs.readJson('foo.json')).toEqual(json);
    });

    test('should apply prettier', async () => {
      const vfs = createTmpVfs({ log });

      await writeVfsPackageConfiguration(vfs);
      await vfs.write(
        'src/file.json',
        '{ "a": 1,"b":  [2, 3,4], "very_long_key_for_force_new_line_on_prettier_format":{"d":{"e":5}}}'
      );
      await vfs.write('src/index.ts', 'export const a =1');
      await vfs.write('src/ignored.ejs', '<%=foo% > ___');
      await vfs.formatChangedFiles();
      expect(await vfs.read('src/file.json', 'utf-8')).toBe(
        `{
  "a": 1,
  "b": [2, 3, 4],
  "very_long_key_for_force_new_line_on_prettier_format": { "d": { "e": 5 } }
}
`
      );
      expect(await vfs.read('src/index.ts', 'utf-8')).toBe(`export const a = 1;
`);
      expect(await vfs.read('src/ignored.ejs', 'utf-8')).toBe('<%=foo% > ___');
    });
  });
});

const createTmpVirtualFs = () =>
  new VirtualFs({
    root: '/root',
    initial: {
      'root-file.ts': 'root content',
      'parent/parent-file.ts': 'parent content',
      'parent/child/child-file.ts': 'child content'
    },
    log
  });
const tmpVfs = createTmpVirtualFs();

// eslint-disable-next-line @typescript-eslint/require-array-sort-compare
const expectArrayEq = <T>(left: T[], right: T[]) => expect(left.sort()).toEqual(right.sort());
const change = (name: string, type: FileChangeType, content: ContentLike | null) => ({
  name,
  type,
  content: content ? Buffer.from(content) : content
});
