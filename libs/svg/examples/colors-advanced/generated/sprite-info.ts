export interface SpritesMap {
  sprite: 'close' | 'exit' | 'favourite' | 'folder-colored' | 'sort-by-visibility';
  flags: 'ac' | 'ad' | 'ae' | 'af';
  logos: 'instagram' | 'linkedin' | 'twitter';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  sprite: ['close', 'exit', 'favourite', 'folder-colored', 'sort-by-visibility'],
  flags: ['ac', 'ad', 'ae', 'af'],
  logos: ['instagram', 'linkedin', 'twitter']
};
