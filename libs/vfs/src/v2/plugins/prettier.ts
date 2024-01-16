import { tryFormatPrettier } from '@neodx/pkg-misc';
import { concurrently, isTypeOfString } from '@neodx/std';
import { displayPath, getVfsActions } from '../core/operations';
import type { VfsContentLike } from '../core/types';
import { createVfsPlugin } from '../create-vfs-plugin';

export interface PrettierPluginParams {
  /** Pass `false` to disable auto formatting on apply */
  auto?: boolean;
}

export interface PrettierPluginApi {
  format(path: string): Promise<void>;
  formatAll(): Promise<void>;
}

export function prettier({ auto = true }: PrettierPluginParams = {}) {
  return createVfsPlugin<PrettierPluginApi>('prettier', (vfs, { context, beforeApply }) => {
    const log = context.log.child('prettier');

    async function format(path: string, content: VfsContentLike) {
      log.debug('Formatting %s', displayPath(context, path));
      const formattedContent = await tryFormatPrettier(
        path,
        isTypeOfString(content) ? content : content.toString('utf-8')
      );

      if (formattedContent !== null) {
        await vfs.write(path, formattedContent);
        log.debug('Formatted %s', displayPath(context, path));
      } else {
        log.debug('Skipped %s', displayPath(context, path));
      }
    }

    vfs.format = async (path: string) => await format(path, await vfs.read(path, 'utf-8'));
    vfs.formatAll = async () => {
      log.debug('Formatting all changed files...');
      const changes = await getVfsActions(context, ['create', 'update']);

      await concurrently(changes, async ({ path, content }) => format(path, content), 5);
    };

    if (auto) {
      beforeApply(() => vfs.formatAll!());
    }

    return vfs;
  });
}
