export interface SpritesMap {
  'assets/common': 'close' | 'favourite';
  'assets/format': 'align-left' | 'tag';
}
export const SPRITES_META = {
  'assets/common': ['close', 'favourite'],
  'assets/format': ['align-left', 'tag']
} satisfies {
  'assets/common': Array<'close' | 'favourite'>;
  'assets/format': Array<'align-left' | 'tag'>;
};
