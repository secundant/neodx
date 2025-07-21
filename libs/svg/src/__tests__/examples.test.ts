import { getChangesDump } from '@neodx/vfs/testing';
import { describe, expect, test } from 'vitest';
import { createSvgSpriteBuilder, type CreateSvgSpriteBuilderParams } from '../core/builder.ts';
import { examplesVfs, getExamplesNames } from './testing-utils.ts';

describe('examples', async () => {
  async function generateExample(
    name: string,
    write: boolean,
    options?: CreateSvgSpriteBuilderParams
  ) {
    const builder = createSvgSpriteBuilder({
      vfs: {
        path: examplesVfs.child(name).path,
        eslint: false,
        readonly: !write
      },
      output: 'generated',
      metadata: 'generated/sprite-info.ts',
      inputRoot: 'assets',
      ...options
    });

    await builder.load(['**/*.svg']);
    await builder.__.outputVfs.delete('.');
    await builder.__.vfs.apply();
    await builder.build({ apply: write });

    return { vfs: builder.__.vfs };
  }

  const examples = (await getExamplesNames()) as Array<keyof typeof optionsMap>;
  const optionsMap = {
    'groups-without-root': {
      group: true
    },
    'groups-with-root': {
      group: true,
      root: 'assets'
    },
    react: {
      group: true,
      root: 'assets'
    },
    colors: {
      root: 'assets',
      resetColors: {
        replace: {
          from: ['#000000', '#ffffff', '#000', '#fff', 'black', 'white'],
          to: 'currentColor'
        }
      }
    },
    'colors-advanced': {
      root: 'assets',
      group: true,
      resetColors: [
        {
          include: /^flags/,
          replace: {
            from: 'white',
            to: 'currentColor'
          }
        },
        {
          keep: '#DB3B4B',
          exclude: [/^flags/, /^logos/, /-colored\.svg$/],
          replace: [
            {
              from: '#6C707E',
              to: 'currentColor'
            }
          ],
          properties: ['fill', 'stroke'],
          replaceUnknown: 'var(--icon-secondary-color)'
        }
      ]
    },
    metadata: {
      root: 'assets',
      group: true,
      fileName: '{name}.{hash:8}.svg',
      metadata: {
        path: 'generated/meta.ts'
      }
    }
  };

  test.each(examples)(`"%s" example should replay same output`, async name => {
    const { vfs } = await generateExample(name, false, optionsMap[name]);

    expect(await getChangesDump(vfs)).toMatchSnapshot();
    await vfs.apply();
  });

  test.each(examples)(`"%s" example should generate files`, async name => {
    const { vfs } = await generateExample(name, true, optionsMap[name]);

    expect((await vfs.scan()).sort()).toMatchSnapshot();
  });
});
