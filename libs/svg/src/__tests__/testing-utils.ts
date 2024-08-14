import { createLogger } from '@neodx/log/node';
import { concurrently, entries, fromEntries, isTypeOfString, lazyValue } from '@neodx/std';
import { merge } from '@neodx/std/merge';
import type { FirstArg } from '@neodx/std/shared';
import { createVfs, type VirtualInitializer } from '@neodx/vfs';
import { createTmpVfs } from '@neodx/vfs/testing';
import { fileURLToPath } from 'url';

const testVfs = createVfs(fileURLToPath(import.meta.url)).child('..');
const stubsVfs = testVfs.child('__stubs__');
export const examplesVfs = testVfs.child('__examples__');

export const svgTestLog = createLogger({ level: 'error' });

export const getExamplesNames = () => examplesVfs.readDir();
/**
 * Returns a map of all stubs in the `__stubs__` directory.
 * Stub value is a content of the stub file.
 * @returns { { [stubsGroup: string]: { [stubName: string]: string } } }
 */
export const getSvgStubs = lazyValue(async () =>
  fromEntries(
    await concurrently(await stubsVfs.readDir(), async group => [
      group,
      fromEntries(
        await concurrently(await stubsVfs.readDir(group), async name => [
          name,
          await stubsVfs.child(group).read(name, 'utf-8')
        ])
      )
    ])
  )
);

export const readStubFile = async (name: string) => await stubsVfs.read(fixSvgExt(name), 'utf-8');
export const createSvgTestVfs = async (
  stubs: VirtualInitializer = {},
  params?: FirstArg<typeof createTmpVfs>
) =>
  await createTmpVfs({
    ...params,
    files: merge(await mapStubs(stubs), params?.files ?? {})
  });

/**
 * @example
 * mapStubs({ 'my/file.svg': 'mask/flag-uk' })
 */
const mapStubs = async (stubs: VirtualInitializer): Promise<VirtualInitializer> =>
  fromEntries(
    await concurrently(
      entries(stubs),
      async ([name, stub]) =>
        [fixSvgExt(name), isTypeOfString(stub) ? await readStubFile(stub) : mapStubs(stub)] as [
          string,
          string | VirtualInitializer
        ]
    )
  );

const fixSvgExt = (path: string) => (path.endsWith('.svg') ? path : `${path}.svg`);
