export interface SpritesMap {
  sprite: 'arrow-drop-down' | 'arrow-drop-up';
}
export const SPRITES_META = {
  sprite: ['arrow-drop-down', 'arrow-drop-up']
} satisfies {
  sprite: Array<'arrow-drop-down' | 'arrow-drop-up'>;
};
