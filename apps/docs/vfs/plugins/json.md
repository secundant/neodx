# `@neodx/vfs` - `json` plugin <Badge type="tip" text="builtin" />

Set of integration for `package.json` files.

```typescript
import { createVfs } from '@neodx/vfs';

const vfs = createVfs(process.cwd());

// top-level methods:
const json = await vfs.readJson('file.json');

await vfs.writeJson('file.json', { ...json, foo: 'bar' });
// same as
await vfs.updateJson('file.json', json => ({ ...json, foo: 'bar' }));

// file api:
const file = vfs.jsonFile('file.json');
const fileContent = await file.readJson();

await file.writeJson({ ...fileContent, foo: 'bar' });
await file.updateJson(json => ({ ...json, foo: 'bar' }));
```

## API

```typescript
interface JsonPluginApi {
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

interface JsonFileApi<FileContents extends JSONValue | unknown = unknown> {
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

type JsonUpdate<T> = (json: T) => T | void | Promise<T | void>;
```
