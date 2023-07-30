# Figma API

Basic API client for Figma. You can find some usage examples in these references:

- [Export API](./export/)
- [Recipe: Traverse Figma File](../recipes/traverse-figma-file.md)

```typescript
declare function createFigmaApi(params: CreateFigmaApiParams): FigmaApi;

const figma = createFigmaApi({
  /* ... */
});
```

## `CreateFigmaApiParams`

```typescript
export interface CreateFigmaApiParams {
  /**
   * The base URL of the Figma API (with version).
   * @default 'https://api.figma.com/v1'
   */
  baseUrl?: string;
  /**
   * The fetch function to use.
   * @default globalThis.fetch
   * @attention Will be replaced with our fetch client in the future.
   */
  fetch?: typeof fetch;
  /**
   * The logger implementation.
   * @see `@neodx/logger`
   * @default Logger with `debug` level.
   */
  log?: LoggerMethods<'info' | 'error' | 'debug'>;
  /**
   * The access token of the Figma API (OAuth2).
   * @see https://www.figma.com/developers/api#access-tokens
   */
  accessToken?: string;
  /**
   * The personal access token of the Figma API.
   * @default process.env.FIGMA_TOKEN
   * @see https://www.figma.com/developers/api#access-tokens
   */
  personalAccessToken?: string;
}
```

## `FigmaApi`

For details about the Figma API, see [Figma API Reference](https://www.figma.com/developers/api)
or our [Types for Figma API](https://github.com/secundant/neodx/blob/main/libs/figma/src/core/figma-api.h.ts).

### Files

- `getFile({ id, ...params }: GetFileParams): GetFileResult`
  > [GET /v1/files/:key](https://www.figma.com/developers/api#get-files-endpoint)
- `getFileNodes<Node extends AnyNode>({ id, ...params }: GetFileNodesParams): GetFileNodesResult<Node>`
  > [GET /v1/files/:key/nodes](https://www.figma.com/developers/api#get-file-nodes-endpoint)
- `getImage({ id, ...params }: GetImageParams)`: `GetImageResult`
  > [GET /v1/images/:key](https://www.figma.com/developers/api#get-images-endpoint)
- `getImageFills({ id }: GetImageFillsParams)`: `GetImageFillsResult`
  > [GET /v1/files/:key/images](https://www.figma.com/developers/api#get-image-fills-endpoint)

### Comments

- `getComments({ id }: GetCommentsParams)`: `GetCommentsResult`
  > [GET /v1/files/:file_key/comments](https://www.figma.com/developers/api#get-comments-endpoint)
- `postComments({ id, ...body }: PostCommentsParams)`: `PostCommentResult`
  > [POST /v1/files/:file_key/comments](https://www.figma.com/developers/api#post-comments-endpoint)
- `deleteComments({ id, comment_id }: DeleteCommentsParams)`: `void`
  > [DELETE /v1/files/:file_key/comments/:comment_id](https://www.figma.com/developers/api#delete-comments-endpoint)

### Users

- `getMe()`: `GetUserMeResult`
  > [GET /v1/me](https://www.figma.com/developers/api#users-endpoints)

### Versions

- `getVersions({ id }: GetVersionsParams)`: `GetVersionsResult`
  > [GET /v1/files/:key/versions](https://www.figma.com/developers/api#version-history-endpoints)

### Teams and projects

- `getTeamProjects({ team_id }: GetTeamProjectsParams)`: `GetTeamProjectsResult`
  > GET /v1/teams/:team_id/projects
- `getProjectFiles({ project_id }: GetProjectFilesParams)`: `GetProjectFilesResult`
  > GET /v1/projects/:project_id/files

### Components and styles

::: warning
These APIs are required at least [Figma Professional plan](https://www.figma.com/pricing/)
:::

- `getTeamComponents({ team_id }: GetTeamComponentsParams)`: `GetTeamComponentsResult`
  > GET /v1/teams/:team_id/components
- `getFileComponents({ id }: GetFileComponentsParams)`: `GetFileComponentsResult`
  > GET /v1/files/:file_key/components
- `getComponent({ key }: GetComponentParams)`: `GetComponentResult`
  > GET /v1/components/:key
- `getTeamComponentSets({ team_id }: GetTeamComponentSetsParams)`: `GetTeamComponentSetsResult`
  > GET /v1/teams/:team_id/component_sets
- `getFileComponentSets({ id }: GetFileComponentSetsParams)`: `GetFileComponentSetsResult`
  > GET /v1/files/:file_key/component_sets
- `getComponentSet({ key }: GetComponentSetParams)`: `GetComponentSetResult`
  > GET /v1/component_sets/:key
- `getTeamStyles({ team_id }: GetTeamStylesParams)`: `GetTeamStylesResult`
  > GET /v1/teams/:team_id/styles
- `getFileStyles({ id }: GetFileStylesParams)`: `GetFileStylesResult`
  > GET /v1/files/:file_key/styles
- `getStyle({ key }: GetStyleParams)`: `GetStyleResult`
  > GET /v1/styles/:key

### Variables

::: danger Not ready
Work in progress...
:::
