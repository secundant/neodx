import { createVfs } from '@neodx/vfs';
import { describe, expect, test } from 'vitest';

describe('svg sprite', async () => {
  const spritesFs = createVfs(new URL('../public/sprites', import.meta.url).pathname);
  const sprites = await spritesFs.readDir();
  const spriteByName = Object.fromEntries(
    await Promise.all(sprites.map(async sprite => [sprite, await spritesFs.read(sprite, 'utf-8')]))
  );
  const mergedSprite = Object.values(spriteByName).join('\n');

  test('should group', () => {
    expect(Object.keys(spriteByName)).toEqual(['common.svg', 'format.svg']);
  });

  test('should replace all colors', async () => {
    expect(mergedSprite).not.toContain('#F1F2F3');
    expect(mergedSprite).not.toContain('#000');
    expect(mergedSprite).not.toContain('#eee');
  });

  test('should not replace non-specified color', async () => {
    expect(mergedSprite).toContain('#AAA');
    expect(mergedSprite).toContain('#F1E2C3');
  });
});
