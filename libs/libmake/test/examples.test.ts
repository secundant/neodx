import { readdirSync } from 'node:fs';
import { buildExample, EXAMPLES_BASE_URL, getExampleDistPath } from './lib/build-example';

describe('examples', () => {
  const examplesNames = readdirSync(EXAMPLES_BASE_URL);
  const testRunner = test.each(examplesNames);

  testRunner('Build example "%s"', async name => {
    await buildExample(name);
    const distFiles = readdirSync(getExampleDistPath(name));

    expect(distFiles.length).toBeGreaterThan(0);
  });
});
