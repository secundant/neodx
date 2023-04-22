import { describe, expect, test } from 'vitest';
import { createColors } from './create-colors';

describe('create-colors', () => {
  const colors = createColors(true);

  test('should wrap by default', async () => {
    expect(colors.underline('foo')).toMatchInlineSnapshot('"[4mfoo[24m"');
  });
});
