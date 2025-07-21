# Figma Client

::: danger
WIP; TODO UPDATE BEFORE RELEASE
:::

`FigmaClient` is the high-level abstraction built on top of the Figma API that provides a friendly interface to interact with Figma entities.

```ts
declare async function createFigmaClient(params?: FigmaClientParams): Promise<FigmaClient>;
```

```ts
// use this as a reference:
export async function createFigmaClient({
  vfs = createVfs(process.cwd()),
  api = createFigmaApi(),
  cache: enableCache = true,
  cacheNetwork = true
}: FigmaClientParams = {}) {
  const cache = await createCacheSystem('figma', vfs, !enableCache);
  const cacheMeta = await cache.meta();

  const client = {
    api,
    cache,
    cacheMeta,
    file: (id: string) => ({
      id,
      api,
      cacheMeta: cacheMeta.scoped(`file:${id}`),
      client,
      ...mapFileApi(api, { id }, cacheNetwork)
    }),
    team: (id: string) => ({
      id,
      api,
      client,
      cacheMeta: cacheMeta.scoped(`team:${id}`),
      ...mapTeamApi(api, { team_id: id }, cacheNetwork)
    }),
    me: api.getMe,
    style: (key: string) => mapFigmaApiResult(api.getStyle({ key }), prop('meta')),
    component: (key: string) => mapFigmaApiResult(api.getComponent({ key }), prop('meta')),
    componentSet: (key: string) => mapFigmaApiResult(api.getComponentSet({ key }), prop('meta')),
    projectFiles: (projectId: string) =>
      mapFigmaApiResult(api.getProjectFiles({ project_id: projectId }), prop('files'))
  };

  return client;
}
```

## `FigmaClient`

- [FigmaAPI](./figma-api.md)

```ts
interface FigmaClient {
  // Scoped APIs

  // An API for interacting with a Figma file
  file: (id: string) => FigmaFileClient;
  // An API for interacting with a Figma team
  team: (id: string) => FigmaTeamClient;

  // Global APIs

  // @see `api.getMe`
  me: () => Promise<FigmaUser>;
  // @see `api.getStyle`
  style: (key: string) => Promise<FigmaStyle>;
  // @see `api.getComponent`
  component: (key: string) => Promise<FigmaComponent>;
  // @see `api.getComponentSet`
  componentSet: (key: string) => Promise<FigmaComponentSet>;
  // @see `api.getProjectFiles`
  projectFiles: (projectId: string) => Promise<FigmaProjectFiles>;

  // Reference to the Figma API

  api: FigmaAPI;
}
```

## Related

- [Using Figma Client](../using-client.md)
