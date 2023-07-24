import { deepReadDir } from '@neodx/fs';
import { getChangesHash } from '@neodx/vfs/testing-utils';
import { describe, expect, test } from 'vitest';
import type { GenerateParams } from '..';
import { generateExample, getExamplesNames } from './testing-utils';

describe('examples', () => {
  const examples = getExamplesNames();
  const optionsMap: Record<string, Partial<GenerateParams>> = {
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
          replaceUnknown: 'var(--icon-color)'
        }
      ]
    },
    metadata: {
      root: 'assets',
      group: true,
      fileName: '{name}.{hash:8}.svg',
      metadata: {
        path: 'generated/meta.ts',
        types: true,
        runtime: {
          viewBox: true,
          size: true
        }
      }
    }
  };

  test.each(examples)(`"%s" example should replay same output`, async name => {
    const { vfs } = await generateExample(name, false, optionsMap[name]);

    expect(await getChangesHash(vfs)).toMatchSnapshot();
  });

  test.each(examples)(`"%s" example should generate files`, async name => {
    const { vfs } = await generateExample(name, true, optionsMap[name]);

    expect(await deepReadDir(vfs.root, { absolute: false })).toMatchSnapshot();
  });
});
