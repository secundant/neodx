import { readdirSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { buildExample, EXAMPLES_BASE_URL, getExampleDistPath } from './lib/build-example';

/**
 * Skipped because of process.chdir() problem with vitest
 * @see https://github.com/vitest-dev/vitest/issues/1436
 */
describe.skip('examples', () => {
  const runAll = true;
  const includes = ['advanced-mixed'];
  const examplesNames = readdirSync(EXAMPLES_BASE_URL);
  const testRunner = test.each(
    runAll ? examplesNames : examplesNames.filter(name => includes.includes(name))
  );

  testRunner('Build example "%s"', async name => {
    await buildExample(name);
    const distFiles = readdirSync(getExampleDistPath(name));

    expect(distFiles.length).toBeGreaterThan(0);
  });
});
