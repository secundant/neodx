import { createTaskRunner } from '@neodx/internal/experimental';
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
  format(path: string): Promise<boolean>;
  // TODO Return information about formatted files count
  formatAll(): Promise<void>;
}

export function prettier({ auto = true }: PrettierPluginParams = {}) {
  return createVfsPlugin<PrettierPluginApi>('prettier', (vfs, { context, beforeApply }) => {
    const log = context.log.child('prettier');
    const { task } = createTaskRunner({ log });

    const format = task(
      'format',
      async (path: string, content: VfsContentLike) => {
        const formattedContent = await tryFormatPrettier(
          path,
          isTypeOfString(content) ? content : content.toString('utf-8')
        );

        if (formattedContent !== null) {
          await vfs.write(path, formattedContent);
        }
        return formattedContent !== null;
      },
      {
        mapSuccessMessage: (formatted, path) =>
          `${displayPath(context, path)} ${formatted ? 'formatted' : 'skipped'}`
      }
    );

    vfs.format = async (path: string) => await format(path, await vfs.read(path, 'utf-8'));
    vfs.formatAll = task(
      'format all',
      async () => {
        await concurrently(
          await getVfsActions(context, ['create', 'update']),
          async ({ path, content }) => format(path, content),
          5
        );
      },
      {
        mapSuccessMessage: () => 'formatted all changed files'
      }
    );

    if (auto) {
      beforeApply(() => vfs.formatAll!());
    }

    return vfs;
  });
}
