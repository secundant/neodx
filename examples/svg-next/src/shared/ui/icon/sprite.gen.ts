export interface SpritesMap {
  sprite:
    | 'add'
    | 'autoscroll-from-source'
    | 'autoscroll-to-source'
    | 'build-server-protocol'
    | 'build'
    | 'c-make-tool-window'
    | 'changes'
    | 'checkmark'
    | 'commit';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  sprite: [
    'add',
    'autoscroll-from-source',
    'autoscroll-to-source',
    'build-server-protocol',
    'build',
    'c-make-tool-window',
    'changes',
    'checkmark',
    'commit'
  ]
};
