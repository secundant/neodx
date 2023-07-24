export interface SpritesMap {
  common: 'close' | 'favourite';
  format: 'align-left' | 'tag';
}
export const SPRITES_META = {
  common: ['close', 'favourite'],
  format: ['align-left', 'tag']
} satisfies {
  common: Array<'close' | 'favourite'>;
  format: Array<'align-left' | 'tag'>;
};
