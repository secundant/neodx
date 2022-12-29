export interface SpritesMap {
  sprite: 'arrow-drop-down' | 'arrow-drop-up';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  sprite: ['arrow-drop-down', 'arrow-drop-up']
};
