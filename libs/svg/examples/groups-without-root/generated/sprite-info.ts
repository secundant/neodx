export interface SpritesMap {
  'assets/common': 'close' | 'favourite';
  'assets/format': 'align-left' | 'tag';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  'assets/common': ['close', 'favourite'],
  'assets/format': ['align-left', 'tag']
};
