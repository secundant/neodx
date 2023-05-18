export interface SpritesMap {
  general:
    | 'add'
    | 'autoscroll-from-source'
    | 'autoscroll-to-source'
    | 'checkmark'
    | 'chevron-down-large'
    | 'chevron-down'
    | 'chevron-left'
    | 'chevron-right'
    | 'chevron-up-large'
    | 'chevron-up'
    | 'close-small-hovered'
    | 'close-small'
    | 'close'
    | 'collapse-all'
    | 'copy'
    | 'cut'
    | 'delete'
    | 'down'
    | 'download'
    | 'edit'
    | 'exit'
    | 'expand-all'
    | 'export'
    | 'external-link'
    | 'filter'
    | 'groups'
    | 'help'
    | 'hide'
    | 'history'
    | 'ide-update'
    | 'import'
    | 'layout'
    | 'left'
    | 'list-files'
    | 'locate'
    | 'locked'
    | 'more-horizontal'
    | 'more-vertical'
    | 'move-down'
    | 'move-up'
    | 'open-in-tool-window'
    | 'open-new-tab'
    | 'open'
    | 'pagination'
    | 'paste'
    | 'pin'
    | 'plugin-update'
    | 'preview-horizontally'
    | 'preview-vertically'
    | 'print'
    | 'project-structure'
    | 'project-wide-analysis-off'
    | 'project-wide-analysis-on'
    | 'redo'
    | 'refresh'
    | 'remove'
    | 'right'
    | 'run-anything'
    | 'save'
    | 'scroll-down'
    | 'search'
    | 'settings'
    | 'show-as-tree'
    | 'show'
    | 'soft-wrap'
    | 'sort-alphabetically'
    | 'sort-by-duration'
    | 'sort-by-type'
    | 'sort-by-usage'
    | 'sort-by-visibility'
    | 'sort-by'
    | 'split-horizontally'
    | 'split-vertically'
    | 'undo'
    | 'unlocked'
    | 'up'
    | 'upload'
    | 'vcs';
  'tool-windows':
    | 'ant'
    | 'aws-glue'
    | 'bookmarks'
    | 'build-server-protocol'
    | 'build'
    | 'c-make-tool-window'
    | 'changes'
    | 'commit'
    | 'concurrency-diagram-toolwindow'
    | 'coverage'
    | 'cwm-access'
    | 'cwm-users'
    | 'database-changes'
    | 'dataproc-tool-window'
    | 'dbms'
    | 'debug'
    | 'dependencies'
    | 'documentation'
    | 'donate'
    | 'endpoints'
    | 'exception-analyzer'
    | 'find-external-usages'
    | 'find'
    | 'gitlab'
    | 'gradle'
    | 'hierarchy'
    | 'hive'
    | 'jupyter-tool-window'
    | 'kafka'
    | 'kotlin-tool-window'
    | 'learn'
    | 'makefile-tool-window'
    | 'maven'
    | 'messages'
    | 'new-u-i'
    | 'notifications'
    | 'npm'
    | 'package-manager'
    | 'problems'
    | 'profiler'
    | 'project'
    | 'pull-requests'
    | 'python-console-tool-window'
    | 'repositories'
    | 'run'
    | 'rust'
    | 'sbt-icon'
    | 'sbt-shell'
    | 'sci-view'
    | 'services'
    | 'setting-sync'
    | 'space-tool-window'
    | 'spring'
    | 'structure'
    | 'task'
    | 'terminal'
    | 'todo'
    | 'transfer'
    | 'unknown'
    | 'vcs'
    | 'web-locator'
    | 'web-server'
    | 'web'
    | 'writerside-preview'
    | 'writerside';
}

export const SPRITES_META: { [K in keyof SpritesMap]: SpritesMap[K][] } = {
  general: [
    'add',
    'autoscroll-from-source',
    'autoscroll-to-source',
    'checkmark',
    'chevron-down-large',
    'chevron-down',
    'chevron-left',
    'chevron-right',
    'chevron-up-large',
    'chevron-up',
    'close-small-hovered',
    'close-small',
    'close',
    'collapse-all',
    'copy',
    'cut',
    'delete',
    'down',
    'download',
    'edit',
    'exit',
    'expand-all',
    'export',
    'external-link',
    'filter',
    'groups',
    'help',
    'hide',
    'history',
    'ide-update',
    'import',
    'layout',
    'left',
    'list-files',
    'locate',
    'locked',
    'more-horizontal',
    'more-vertical',
    'move-down',
    'move-up',
    'open-in-tool-window',
    'open-new-tab',
    'open',
    'pagination',
    'paste',
    'pin',
    'plugin-update',
    'preview-horizontally',
    'preview-vertically',
    'print',
    'project-structure',
    'project-wide-analysis-off',
    'project-wide-analysis-on',
    'redo',
    'refresh',
    'remove',
    'right',
    'run-anything',
    'save',
    'scroll-down',
    'search',
    'settings',
    'show-as-tree',
    'show',
    'soft-wrap',
    'sort-alphabetically',
    'sort-by-duration',
    'sort-by-type',
    'sort-by-usage',
    'sort-by-visibility',
    'sort-by',
    'split-horizontally',
    'split-vertically',
    'undo',
    'unlocked',
    'up',
    'upload',
    'vcs'
  ],
  'tool-windows': [
    'ant',
    'aws-glue',
    'bookmarks',
    'build-server-protocol',
    'build',
    'c-make-tool-window',
    'changes',
    'commit',
    'concurrency-diagram-toolwindow',
    'coverage',
    'cwm-access',
    'cwm-users',
    'database-changes',
    'dataproc-tool-window',
    'dbms',
    'debug',
    'dependencies',
    'documentation',
    'donate',
    'endpoints',
    'exception-analyzer',
    'find-external-usages',
    'find',
    'gitlab',
    'gradle',
    'hierarchy',
    'hive',
    'jupyter-tool-window',
    'kafka',
    'kotlin-tool-window',
    'learn',
    'makefile-tool-window',
    'maven',
    'messages',
    'new-u-i',
    'notifications',
    'npm',
    'package-manager',
    'problems',
    'profiler',
    'project',
    'pull-requests',
    'python-console-tool-window',
    'repositories',
    'run',
    'rust',
    'sbt-icon',
    'sbt-shell',
    'sci-view',
    'services',
    'setting-sync',
    'space-tool-window',
    'spring',
    'structure',
    'task',
    'terminal',
    'todo',
    'transfer',
    'unknown',
    'vcs',
    'web-locator',
    'web-server',
    'web',
    'writerside-preview',
    'writerside'
  ]
};
