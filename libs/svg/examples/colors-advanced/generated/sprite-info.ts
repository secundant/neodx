export interface SpritesMap {
  sprite: 'close' | 'exit' | 'favourite' | 'folder-colored' | 'sort-by-visibility';
  flags: 'ac' | 'ad' | 'ae' | 'af';
  logos: 'linkedin' | 'twitter';
}
export const SPRITES_META: {
  sprite: Array<'close' | 'exit' | 'favourite' | 'folder-colored' | 'sort-by-visibility'>;
  flags: Array<'ac' | 'ad' | 'ae' | 'af'>;
  logos: Array<'linkedin' | 'twitter'>;
} = {
  sprite: ['close', 'exit', 'favourite', 'folder-colored', 'sort-by-visibility'],
  flags: ['ac', 'ad', 'ae', 'af'],
  logos: ['linkedin', 'twitter']
};
