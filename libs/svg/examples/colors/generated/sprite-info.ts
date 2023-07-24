export interface SpritesMap {
  sprite: 'custom' | 'fill' | 'mixed' | 'stroke';
}
export const SPRITES_META = {
  sprite: ['custom', 'fill', 'mixed', 'stroke']
} satisfies {
  sprite: Array<'custom' | 'fill' | 'mixed' | 'stroke'>;
};
