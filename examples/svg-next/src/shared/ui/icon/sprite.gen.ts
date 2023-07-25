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
export const SPRITES_META = {
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
} satisfies {
  sprite: Array<
    | 'add'
    | 'autoscroll-from-source'
    | 'autoscroll-to-source'
    | 'build-server-protocol'
    | 'build'
    | 'c-make-tool-window'
    | 'changes'
    | 'checkmark'
    | 'commit'
  >;
};
