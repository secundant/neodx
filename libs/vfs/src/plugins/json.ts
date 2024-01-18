import {
  parseJson,
  type ParseJsonParams,
  serializeJson,
  type SerializeJsonParams
} from '@neodx/fs';
import type { BaseVfs } from '../core/types';
import { createVfsPlugin } from '../create-vfs-plugin';

export interface JsonPluginApi {
  jsonFile<FileContents extends JSONValue | unknown = unknown>(
    path: string
  ): JsonFileApi<FileContents>;
  readJson<T extends JSONValue | unknown = unknown>(
    path: string,
    options?: ParseJsonParams
  ): Promise<T>;
  writeJson<T extends JSONValue | unknown = unknown>(
    path: string,
    json: T,
    options?: SerializeJsonParams
  ): Promise<void>;
  updateJson<T extends JSONValue | unknown = unknown>(
    path: string,
    updater: JsonUpdate<T>,
    options?: ParseJsonParams & SerializeJsonParams
  ): Promise<void>;
}

export interface JsonFileApi<FileContents extends JSONValue | unknown = unknown> {
  read<T extends FileContents = FileContents>(options?: ParseJsonParams): Promise<T>;
  write<T extends FileContents = FileContents>(
    json: T,
    options?: SerializeJsonParams
  ): Promise<void>;
  update<T extends FileContents = FileContents>(
    updater: JsonUpdate<T>,
    options?: ParseJsonParams & SerializeJsonParams
  ): Promise<void>;
}

export type JsonUpdate<T> = (json: T) => T | void | Promise<T | void>;

export function json() {
  return createVfsPlugin<JsonPluginApi>('json', vfs => {
    vfs.jsonFile = path => createJsonFileApi(vfs, path);
    vfs.readJson = (path, options) => readVfsJson(vfs, path, options);
    vfs.writeJson = (path, json, options) => writeVfsJson(vfs, path, json, options);
    vfs.updateJson = (path, updater, options) => updateVfsJson(vfs, path, updater, options);
    return vfs;
  });
}

export function createJsonFileApi<FileContents extends JSONValue | unknown = unknown>(
  vfs: BaseVfs,
  path: string
): JsonFileApi<FileContents> {
  return {
    read: options => readVfsJson(vfs, path, options),
    write: (json, options) => writeVfsJson(vfs, path, json, options),
    update: (updater, options) => updateVfsJson(vfs, path, updater, options)
  };
}

export async function readVfsJson<T extends JSONValue | unknown = unknown>(
  vfs: BaseVfs,
  path: string,
  options?: ParseJsonParams
) {
  try {
    return parseJson<T>(await vfs.read(path, 'utf-8'), options);
  } catch (error) {
    throw new Error(`Cannot parse ${path}:\n${(error as Error).message}`);
  }
}

export async function writeVfsJson<T extends JSONValue | unknown = unknown>(
  vfs: BaseVfs,
  path: string,
  json: T,
  options?: SerializeJsonParams
) {
  return await vfs.write(path, serializeJson(json, options));
}

export async function updateVfsJson<T extends JSONValue | unknown = unknown>(
  vfs: BaseVfs,
  path: string,
  updater: JsonUpdate<T>,
  options?: ParseJsonParams & SerializeJsonParams
) {
  // TODO Implement support for empty, damaged, or nonexistent files
  const current = await readVfsJson(vfs, path, options);

  return await writeVfsJson(vfs, path, (await updater(current as any)) ?? current, options);
}

// TODO Probably, move away to a more generic space
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export type JSONArray = JSONValue[];
export interface JSONObject {
  [member: string]: JSONValue;
}
