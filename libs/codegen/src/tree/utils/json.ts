import type { Tree } from '@/tree';
import type { BaseJsonObject, ParseJsonParams, SerializeJsonParams } from '@/utils/json';
import { parseJson, serializeJson } from '@/utils/json';

export async function readTreeJson<T extends BaseJsonObject>(
  tree: Tree,
  path: string,
  options?: ParseJsonParams
) {
  try {
    return parseJson<T>(await tree.read(path, 'utf-8'), options);
  } catch (error) {
    throw new Error(`Cannot parse ${path}:\n${(error as Error).message}`);
  }
}

export async function writeTreeJson<T extends BaseJsonObject>(
  tree: Tree,
  path: string,
  value: T,
  options?: SerializeJsonParams
) {
  await tree.write(path, serializeJson(value, options));
}

export async function updateTreeJson<
  Input extends BaseJsonObject,
  Output extends BaseJsonObject = Input
>(
  tree: Tree,
  path: string,
  updateFn: (input: Input) => Output | Promise<Output>,
  options?: ParseJsonParams & SerializeJsonParams
) {
  await writeTreeJson(tree, path, await updateFn(await readTreeJson(tree, path, options)), options);
}
