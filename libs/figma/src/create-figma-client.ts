import { createCache } from '@neodx/internal/cache/cache';
import { type AutoLoggerInput, createAutoLogger } from '@neodx/log';
import { identity, mapValues, memoize, prop } from '@neodx/std';
import { type AnyFn, type FirstArg, redefineName } from '@neodx/std/shared';
import { type AutoVfsInput, createAutoVfs, type VfsLogMethod } from '@neodx/vfs';
import { createFigmaApi, type FigmaApi } from './core/create-figma-api.ts';
import type { CommonFigmaResponse, GetFileParams } from './core/figma-api.h.ts';
import { createFileGraph } from './graph';

export type FigmaClient = Awaited<ReturnType<typeof createFigmaClient>>;
export type FigmaClientFile = ReturnType<FigmaClient['file']>;
export type FigmaClientTeam = ReturnType<FigmaClient['team']>;

export interface FigmaClientParams {
  vfs?: AutoVfsInput;
  log?: AutoLoggerInput<VfsLogMethod>;
  /**
   * Custom Figma API instance.
   * @default createFigmaApi()
   */
  api?: FigmaApi;
  /** Pass `false` to disable cache */
  cache?: boolean;
  /** Pass `false` to disable network requests caching */
  cacheNetwork?: boolean;
}

/**
 * Experimental Figma Client.
 * Provides a high-level API for working with Figma files.
 *
 * @experimental
 * @example Simple usage
 * const figma = await createFigmaClient();
 * const user = await figma.me();
 *
 * console.log('my email is', user.email);
 *
 * @example File API
 * const figma = await createFigmaClient();
 * const file = figma.file('my-file-id');
 * const graph = await file.asGraph(); // create a human-friendly file graph
 *
 * console.log('components:', graph.registry.types.COMPONENT.map(it => it.source.name));
 *
 * console.log('comments:', await file.comments());
 */
export async function createFigmaClient({
  vfs: vfsInput = process.cwd(),
  log: logInput = 'info',
  api = createFigmaApi(),
  cache: cacheInput = true,
  cacheNetwork = true
}: FigmaClientParams = {}) {
  const log = createAutoLogger(logInput, { name: 'figma' });
  const vfs = createAutoVfs(vfsInput, { log: log.child('vfs') });
  const cache = await createCache({
    log,
    vfs,
    path: '{workspaceRoot}/node_modules/.cache/neodx/figma',
    input: [`hash:${api.__.hash}`],
    disabled: Boolean(cacheInput)
  });

  const figma = {
    file: (id: string) => {
      const file = {
        id,
        figma,
        ...mapFileApi(api, { id }, cacheNetwork)
      };

      return {
        ...file,
        asGraph: async (params?: Omit<GetFileParams, 'id'>) =>
          createFileGraph(id, await file.raw(params))
      };
    },
    team: (id: string) => ({
      id,
      figma,
      ...mapTeamApi(api, { team_id: id }, cacheNetwork)
    }),
    me: api.getMe,
    style: (key: string) => mapFigmaApiResult(api.getStyle({ key }), prop('meta')),
    component: (key: string) => mapFigmaApiResult(api.getComponent({ key }), prop('meta')),
    componentSet: (key: string) => mapFigmaApiResult(api.getComponentSet({ key }), prop('meta')),
    projectFiles: (projectId: string) =>
      mapFigmaApiResult(api.getProjectFiles({ project_id: projectId }), prop('files')),
    /**
     * @internal
     */
    __: {
      log,
      vfs,
      api,
      cache
    }
  };

  return figma;
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
        ? memoize(handler, { key: JSON.stringify })
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
type FigmaApiKey = Exclude<keyof FigmaApi, '__'>;
type MakeOptionalIfShapeIsEmpty<Shape extends object> =
  Record<string, never> extends Shape ? Shape | void : Shape;
