import type { ParseJsonParams, SerializeJsonParams } from '@neodx/fs';
import { parseJson, serializeJson } from '@neodx/fs';
import type { BaseVFS } from '../types';

export async function readVfsJson<T>(vfs: BaseVFS, path: string, options?: ParseJsonParams) {
  try {
    return parseJson<T>(await vfs.read(path, 'utf-8'), options);
  } catch (error) {
    throw new Error(`Cannot parse ${path}:\n${(error as Error).message}`);
  }
}

export async function writeVfsJson<T>(
  vfs: BaseVFS,
  path: string,
  value: T,
  options?: SerializeJsonParams
) {
  await vfs.write(path, serializeJson(value, options));
}

export async function updateVfsJson<Input, Output = Input>(
  vfs: BaseVFS,
  path: string,
  updateFn: (input: Input) => Output | Promise<Output>,
  options?: ParseJsonParams & SerializeJsonParams
) {
  await writeVfsJson(vfs, path, await updateFn(await readVfsJson(vfs, path, options)), options);
}
