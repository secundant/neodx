export interface SpritesMap {
  common: 'close' | 'double-color' | 'favourite';
  format: 'align-left' | 'tag';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  common: ['close', 'double-color', 'favourite'],
  format: ['align-left', 'tag']
};
