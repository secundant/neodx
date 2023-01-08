import { deepReadDir } from '@neodx/fs';
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
      input: ['**/*.svg'],
      inputRoot: 'assets'
    },
    react: {
      group: true,
      input: ['**/*.svg'],
      inputRoot: 'assets'
    }
  };

  test.each(examples)(`"%s" example should replay same output`, async name => {
    const { tree } = await generateExample(name, false, optionsMap[name]);
    const originalChanges = await tree.getChanges();
    const serializedChanges = originalChanges.map(change => ({
      ...change,
      content: change.content?.toString('utf-8')
    }));

    expect(serializedChanges).toMatchSnapshot();
  });

  test.each(examples)(`"%s" example should generate files`, async name => {
    const { tree } = await generateExample(name, true, optionsMap[name]);

    expect(await deepReadDir(tree.root, { absolute: false })).toMatchSnapshot();
  });
});
