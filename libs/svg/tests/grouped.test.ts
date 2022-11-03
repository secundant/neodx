import { generate } from '@/core/generate';
import { resolveRoot } from './shared';

describe('grouped', () => {
  test('should generate groups', async () => {
    await generate(resolveRoot('examples/grouped'));
  });
});
