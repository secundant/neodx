export interface SpritesMap {
  common: 'close' | 'favourite';
  format: 'align-left' | 'tag';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  common: ['close', 'favourite'],
  format: ['align-left', 'tag']
};
