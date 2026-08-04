import { describe, expect, test } from 'vite-plus/test';
import { createColors } from './create-colors';

describe('create-colors', () => {
  const colors = createColors(true, false, true);

  test('should wrap by default', async () => {
    expect(colors.underline('foo')).toMatchInlineSnapshot('"[4mfoo[24m"');
  });
});
