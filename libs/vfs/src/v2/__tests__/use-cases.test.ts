import { describe, expect, test } from 'vitest';
import type { Vfs } from '../create-vfs.ts';
import { createTmpVfs } from '../testing.ts';

describe('vfs use cases', async () => {
  test('should support top-level apply', async () => {
    const vfs = await createTmpVfs({
      files: {
        src: {
          modules: {
            foo: {
              'ui.tsx': 'export const foo = 1;',
              'model.ts': 'export const foo = 1;'
            },
            bar: {
              ui: {
                'index.tsx': 'export const bar = 1;'
              },
              'lib.ts': 'export const bar = 1;'
            }
          }
        }
      }
    });

    async function addReExports(vfs: Vfs) {
      const files = await vfs.glob('**/*.{ts,tsx}', { ignore: 'index.ts' });

      await vfs.write('index.ts', files.map(file => `export * from './${file}';`).join('\n'));
    }
    for (const module of await vfs.glob('src/modules/*')) {
      await addReExports(vfs.child(module));
    }
    await vfs.apply();

    expect(await vfs.read('src/modules/foo/index.ts', 'utf-8')).toMatchInlineSnapshot(`
      "export * from './model.ts';
      export * from './ui.tsx';"
    `);
    expect(await vfs.read('src/modules/bar/index.ts', 'utf-8')).toMatchInlineSnapshot(`
      "export * from './lib.ts';
      export * from './ui/index.tsx';"
    `);
  });
});
