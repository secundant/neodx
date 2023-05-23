import { deepReadDir } from '@neodx/fs';
import { getChangesHash } from '@neodx/vfs/testing-utils';
import { describe, expect, test } from 'vitest';
import type { GenerateParams } from '../index';
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
