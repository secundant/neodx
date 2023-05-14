/* eslint-disable @typescript-eslint/naming-convention */
import type { LoggerMethods } from '@neodx/log';
import { addSearchParams, createRelativeUrl, invariant } from '@neodx/std';
import type { AnyNode } from './figma.h';
import type {
  DeleteCommentsParams,
  GetCommentsParams,
  GetCommentsResult,
  GetComponentParams,
  GetComponentResult,
  GetComponentSetParams,
  GetComponentSetResult,
  GetFileComponentSetsParams,
  GetFileComponentSetsResult,
  GetFileComponentsParams,
  GetFileComponentsResult,
  GetFileNodesParams,
  GetFileNodesResult,
  GetFileParams,
  GetFileResult,
  GetFileStylesParams,
  GetFileStylesResult,
  GetImageFillsParams,
  GetImageFillsResult,
  GetImageParams,
  GetImageResult,
  GetProjectFilesParams,
  GetProjectFilesResult,
  GetStyleParams,
  GetStyleResult,
  GetTeamComponentSetsParams,
  GetTeamComponentSetsResult,
  GetTeamComponentsParams,
  GetTeamComponentsResult,
  GetTeamProjectsParams,
  GetTeamProjectsResult,
  GetTeamStylesParams,
  GetTeamStylesResult,
  GetUserMeResult,
  GetVersionsParams,
  GetVersionsResult,
  PostCommentResult,
  PostCommentsParams
} from './figma-api.h';
import { figmaLogger, logRequest } from './shared';

export interface CreateFigmaApiParams {
  /**
   * The base URL of the Figma API (with version).
   * @default 'https://api.figma.com/v1'
   */
  baseUrl?: string;
  fetch?: typeof fetch;
  logger?: LoggerMethods<'info' | 'error' | 'debug'>;
  accessToken?: string;
  /**
   * The personal access token of the Figma API.
   */
  personalAccessToken?: string;
}

export type FigmaApi = ReturnType<typeof createFigmaApi>;

export function createFigmaApi({
  personalAccessToken,
  accessToken,
  logger = figmaLogger,
  baseUrl = 'https://api.figma.com/v1/',
  fetch = globalThis.fetch
}: CreateFigmaApiParams) {
  invariant(personalAccessToken || accessToken, 'accessToken or personalAccessToken is required');
  async function fetchJson<T>(
    path: string,
    options?: RequestInit & { params?: Record<string, unknown> }
  ) {
    const startTime = Date.now();
    const url = createRelativeUrl(path, baseUrl);

    addSearchParams(url.searchParams, options?.params);

    const response = await fetch(url, {
      ...options,
      headers: Object.assign(
        {
          'Content-Type': 'application/json'
        },
        options?.headers,
        personalAccessToken
          ? {
              'X-Figma-Token': personalAccessToken
            }
          : {
              Authorization: `Bearer ${accessToken}`
            }
      )
    });

    invariant(response.ok, `Wrong response, status: ${response.status} ${response.statusText}`);
    invariant(
      response.status < 400,
      `Wrong response, status: ${response.status} ${response.statusText}`
    );
    const contentType = response.headers.get('content-type');

    invariant(contentType?.includes('application/json'), 'Content-Type must be application/json');
    logRequest(logger, options?.method ?? 'GET', url, Date.now() - startTime);

    return (await response.json()) as Promise<T>;
  }

  return {
    /** @api GET /v1/files/:key */
    async getFile({ id, ...params }: GetFileParams) {
      return fetchJson<GetFileResult>(`/files/${id}`, { params });
    },
    /**
     * The `name`, `lastModified`, `thumbnailUrl`, and `version` attributes are all metadata of the specified file.
     * @api GET /v1/files/:key/nodes
     */
    async getFileNodes<Node extends AnyNode>({ id, ...params }: GetFileNodesParams) {
      return fetchJson<GetFileNodesResult<Node>>(`/files/${id}/nodes`, {
        params
      });
    },
    /** @api GET/v1/images/:key */
    async getImage({ id, ...params }: GetImageParams) {
      return fetchJson<GetImageResult>(`/images/${id}`, { params });
    },
    /** @api GET/v1/files/:key/images */
    async getImageFills({ id }: GetImageFillsParams) {
      return fetchJson<GetImageFillsResult>(`/files/${id}/images`);
    },
    /** @api GET/v1/files/:key/comments */
    async getComments({ id }: GetCommentsParams) {
      return fetchJson<GetCommentsResult>(`/files/${id}/comments`);
    },
    /**
     * This returns the Comment that was successfully posted
     * @see https://www.figma.com/developers/api#post-comments-endpoint
     * @api POST/v1/files/:file_key/comments
     */
    async postComments({ id, ...body }: PostCommentsParams) {
      return fetchJson<PostCommentResult>(`/files/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(body)
      });
    },
    /**
     * Nothing is returned from this endpoint
     * @see https://www.figma.com/developers/api#delete-comments-endpoint
     * @api DELETE/v1/files/:file_key/comments/:comment_id
     */
    async deleteComments({ id, comment_id }: DeleteCommentsParams) {
      return fetchJson(`/files/${id}/comments/${comment_id}`, {
        method: 'DELETE'
      });
    },
    /** @api GET/v1/me */
    async getMe() {
      return fetchJson<GetUserMeResult>('/me');
    },
    /** @api GET/v1/files/:key/versions */
    async getVersions({ id }: GetVersionsParams) {
      return fetchJson<GetVersionsResult>(`/files/${id}/versions`);
    },
    /** @api GET/v1/teams/:team_id/projects */
    async getTeamProjects({ team_id }: GetTeamProjectsParams) {
      return fetchJson<GetTeamProjectsResult>(`/teams/${team_id}/projects`);
    },
    /** @api GET/v1/projects/:project_id/files */
    async getProjectFiles({ project_id }: GetProjectFilesParams) {
      return fetchJson<GetProjectFilesResult>(`/projects/${project_id}/files`);
    },
    /** @api GET/v1/teams/:team_id/components */
    async getTeamComponents({ team_id }: GetTeamComponentsParams) {
      return fetchJson<GetTeamComponentsResult>(`/teams/${team_id}/components`);
    },
    /** @api GET/v1/files/:file_key/components */
    async getFileComponents({ id }: GetFileComponentsParams) {
      return fetchJson<GetFileComponentsResult>(`/files/${id}/components`);
    },
    /** @api GET/v1/components/:key */
    async getComponent({ key }: GetComponentParams) {
      return fetchJson<GetComponentResult>(`/components/${key}`);
    },
    /** @api GET/v1/teams/:team_id/component_sets */
    async getTeamComponentSets({ team_id }: GetTeamComponentSetsParams) {
      return fetchJson<GetTeamComponentSetsResult>(`/teams/${team_id}/component_sets`);
    },
    /** @api GET/v1/files/:file_key/component_sets */
    async getFileComponentSets({ id }: GetFileComponentSetsParams) {
      return fetchJson<GetFileComponentSetsResult>(`/files/${id}/component_sets`);
    },
    /** @api GET/v1/component_sets/:key */
    async getComponentSet({ key }: GetComponentSetParams) {
      return fetchJson<GetComponentSetResult>(`/component_sets/${key}`);
    },
    /** @api GET/v1/teams/:team_id/styles */
    async getTeamStyles({ team_id }: GetTeamStylesParams) {
      return fetchJson<GetTeamStylesResult>(`/teams/${team_id}/styles`);
    },
    /** @api GET/v1/files/:file_key/styles */
    async getFileStyles({ id }: GetFileStylesParams) {
      return fetchJson<GetFileStylesResult>(`/files/${id}/styles`);
    },
    /** @api GET/v1/styles/:key */
    async getStyle({ key }: GetStyleParams) {
      return fetchJson<GetStyleResult>(`/styles/${key}`);
    }
  };
}
