import { cached, createCacheSystem } from '@neodx/internal/cache';
import { identity, mapValues, prop } from '@neodx/std';
import { type AnyFn, type FirstArg, redefineName } from '@neodx/std/shared';
import { createVfs, type Vfs } from '@neodx/vfs';
import { createFigmaApi, type FigmaApi } from './core/create-figma-api.ts';
import type { CommonFigmaResponse } from './core/figma-api.h.ts';

export type FigmaClient = Awaited<ReturnType<typeof createFigmaClient>>;
export type FigmaClientFile = ReturnType<FigmaClient['file']>;
export type FigmaClientTeam = ReturnType<FigmaClient['team']>;

export interface FigmaClientParams {
  vfs?: Vfs;
  api?: FigmaApi;
  cache?: boolean;
  cacheNetwork?: boolean;
}

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
    __: {
      cache,
      cacheMeta
    },
    file: (id: string) => ({
      id,
      __: {
        cacheMeta: cacheMeta.scoped(`file:${id}`)
      },
      api,
      client,
      ...mapFileApi(api, { id }, cacheNetwork)
    }),
    team: (id: string) => ({
      id,
      __: {
        cacheMeta: cacheMeta.scoped(`team:${id}`)
      },
      api,
      client,
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

const createMapper =
  <
    const Shape extends Record<string, FigmaApiKey>,
    const MapResultShape extends Partial<{
      [Key in keyof Shape]: (originalResult: FigmaApiResult<Shape[Key]>) => unknown;
    }>
  >(
    shape: Shape,
    mapResults: MapResultShape = {} as MapResultShape,
    cacheable: (keyof Shape)[] = []
  ) =>
  <BaseParams extends FigmaApiParams<Shape[keyof Shape]>>(
    api: FigmaApi,
    baseParams: BaseParams,
    enableCache = true
  ) =>
    mapValues(shape, (method, key) => {
      async function handler(params?: any) {
        return await mapFigmaApiResult(
          api[method]({ ...baseParams, ...params }),
          (mapResults[key] as any) ?? identity
        );
      }

      redefineName(handler, `${key as string}(original ${method})`);
      return enableCache && cacheable.includes(key)
        ? cached(handler, { key: JSON.stringify })
        : handler;
    }) as {
      [Key in keyof Shape]: (
        params: MakeOptionalIfShapeIsEmpty<Omit<FigmaApiParams<Shape[Key]>, keyof BaseParams>>
      ) => Promise<
        MapResultShape[Key] extends AnyFn
          ? ReturnType<MapResultShape[Key]>
          : FigmaApiResult<Shape[Key]>
      >;
    };

const mapTeamApi = createMapper(
  {
    styles: 'getTeamStyles',
    projects: 'getTeamProjects',
    components: 'getTeamComponents',
    componentSets: 'getTeamComponentSets'
  },
  {
    styles: result => result.meta?.styles ?? [],
    projects: prop('projects'),
    components: result => result.meta?.components ?? [],
    componentSets: result => result.component_sets
  },
  ['styles', 'projects', 'components', 'componentSets']
);
const mapFileApi = createMapper(
  {
    raw: 'getFile',
    nodes: 'getFileNodes',
    images: 'getImage',
    imageFills: 'getImageFills',
    comments: 'getComments',
    addComment: 'postComments',
    deleteComment: 'deleteComments',
    versions: 'getVersions',
    components: 'getFileComponents',
    componentSets: 'getFileComponentSets',
    styles: 'getFileStyles'
  },
  {
    images: prop('images'),
    comments: prop('comments'),
    versions: prop('versions'),
    components: result => result.meta?.components ?? [],
    componentSets: result => result.meta?.component_sets ?? [],
    styles: result => result.meta?.styles ?? []
  },
  [
    'raw',
    'nodes',
    'imageFills',
    'images',
    'comments',
    'versions',
    'components',
    'componentSets',
    'styles'
  ]
);

const mapFigmaApiResult = async <Original extends CommonFigmaResponse, Mapped>(
  promise: Promise<Original>,
  mapFn: (original: Original) => Mapped
) => {
  const result = await promise;

  if (result.error) {
    throw new Error(
      `Figma API Failed with ${result.status ?? 'unknown'} status and the following error: ${result.err ?? '<no error message>'}`,
      {
        cause: result
      }
    );
  }
  return mapFn(result);
};

type FigmaApiParams<Name extends FigmaApiKey> = FirstArg<FigmaApi[Name]>;
type FigmaApiResult<Name extends FigmaApiKey> = Awaited<ReturnType<FigmaApi[Name]>>;
type FigmaApiKey = keyof FigmaApi;
type MakeOptionalIfShapeIsEmpty<Shape extends object> =
  Record<string, never> extends Shape ? Shape | void : Shape;
