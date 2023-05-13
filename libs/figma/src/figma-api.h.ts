import type {
  AnyNode,
  Component,
  ComponentMetadata,
  ComponentSetMetadata,
  DocumentNode,
  FrameOffset,
  Project,
  ProjectFile,
  Style,
  StyleMetadata,
  User,
  Vector,
  Version
} from './figma.h';

export interface GetFileParams extends FileKeyParams {
  /** A specific version ID to get. Omitting this will get the current version of the file */
  version?: string;
  /** If specified, only a subset of the document will be returned corresponding to the nodes listed, their children, and everything between the root node and the listed nodes */
  ids?: string[];
  /** Positive integer representing how deep into the document tree to traverse. For example, setting this to 1 returns only Pages, setting it to 2 returns Pages and all top level objects on each page. Not setting this parameter returns all nodes */
  depth?: number;
  /** Set to "paths" to export vector data */
  geometry?: 'paths';
  /** A comma separated list of plugin IDs and/or the string "shared". Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties. */
  plugin_data?: string;
  /** Set to returns branch metadata for the requested file */
  branch_data?: boolean;
}
export interface GetFileResult extends CommonFigmaResponse {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  document: DocumentNode;
  components: Record<string, Component>;
  schemaVersion: number;
  styles: Record<string, Style>;
  mainFileKey?: string;
  branches?: ProjectFile[];
}

export interface GetFileNodesParams extends FileKeyParams {
  /** list of node IDs to retrieve and convert */
  ids: string[];
  /** A specific version ID to get. Omitting this will get the current version of the file */
  version?: string;
  /** Positive integer representing how deep into the document tree to traverse. For example, setting this to 1 returns only Pages, setting it to 2 returns Pages and all top level objects on each page. Not setting this parameter returns all nodes */
  depth?: number;
  /** Set to "paths" to export vector data */
  geometry?: 'paths';
  /** A comma separated list of plugin IDs and/or the string "shared". Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties. */
  plugin_data?: string;
}
export interface GetFileNodesResult<Node extends AnyNode> extends CommonFigmaResponse {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  nodes: Record<string, FileNode<Node> | null>;
}

export interface GetImageParams extends FileKeyParams {
  /** A comma separated list of node IDs to render */
  ids: string[];
  /** A number between 0.01 and 4, the image scaling factor */
  scale?: number;
  /** A string enum for the image output format */
  format: 'jpg' | 'png' | 'svg' | 'pdf';
  /** Whether to include id attributes for all SVG elements. `Default: false` */
  svg_include_id?: boolean;
  /** Whether to simplify inside/outside strokes and use stroke attribute if possible instead of <mask>. `Default: true` */
  svg_simplify_stroke?: boolean;
  /** Use the full dimensions of the node regardless of whether or not it is cropped or the space around it is empty. Use this to export text nodes without cropping. `Default: false` */
  use_absolute_bounds?: boolean;
  /** A specific version ID to get. Omitting this will get the current version of the file */
  version?: string;
}
export interface GetImageResult extends CommonFigmaResponse {
  images: ImagesDto;
}

export type GetImageFillsParams = FileKeyParams;
export interface GetImageFillsResult extends CommonFigmaResponse {
  images: ImagesDto;
  meta?: { images: ImagesDto };
}

export type GetCommentsParams = FileKeyParams;
export interface GetCommentsResult extends CommonFigmaResponse {
  comments: Comment[];
}

export interface PostCommentsParams extends FileKeyParams {
  /** The text contents of the comment to post */
  message: string;
  /** The position of where to place the comment. This can either be an absolute canvas position or the relative position within a frame. */
  client_meta: Vector | FrameOffset;
  /** (Optional) The comment to reply to, if any. This must be a root comment, that is, you cannot reply to a comment that is a reply itself (a reply has a parent_id). */
  comment_id?: string;
}
export interface PostCommentResult extends CommonFigmaResponse, Comment {}

export interface DeleteCommentsParams extends FileKeyParams {
  comment_id: string;
}
export type DeleteCommentsResult = CommonFigmaResponse;

export interface GetUserMeResult extends CommonFigmaResponse, User {}

export type GetVersionsParams = FileKeyParams;
export interface GetVersionsResult extends CommonFigmaResponse {
  versions: Version[];
}

export interface GetTeamProjectsParams {
  team_id: string;
}
export interface GetTeamProjectsResult extends CommonFigmaResponse {
  projects: Project[];
}

export interface GetProjectFilesParams {
  project_id: string;
  /** Set to returns branch metadata for the requested file */
  branch_data?: boolean;
}
export interface GetProjectFilesResult extends CommonFigmaResponse {
  files: ProjectFile[];
}

export interface GetTeamComponentsParams {
  /** Id of the team to list components from */
  team_id: string;
  /** Number of items in a paged list of results. Defaults to 30. */
  page_size?: number;
  /** Cursor indicating which id after which to start retrieving components for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  after?: number;
  /** Cursor indicating which id before which to start retrieving components for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  before?: number;
}
export interface GetTeamComponentsResult extends CommonFigmaResponse {
  meta?: {
    components: ComponentMetadata[];
    cursor: CursorDto;
  };
}

export type GetFileComponentsParams = FileKeyParams;
export interface GetFileComponentsResult extends CommonFigmaResponse {
  meta?: {
    components: ComponentMetadata[];
  };
}

export interface GetComponentParams {
  /** The unique identifier of the component. */
  key: string;
}
export interface GetComponentResult extends CommonFigmaResponse {
  meta?: ComponentMetadata;
}

export interface GetTeamComponentSetsParams {
  /** Id of the team to list component_sets from */
  team_id: string;
  /** Number of items in a paged list of results. Defaults to 30. */
  page_size?: number;
  /** Cursor indicating which id after which to start retrieving components for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  after?: number;
  /** Cursor indicating which id before which to start retrieving components for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  before?: number;
}
export interface GetTeamComponentSetsResult extends CommonFigmaResponse {
  component_sets: ComponentSetMetadata[];
  cursor: CursorDto;
}

export type GetFileComponentSetsParams = FileKeyParams;
export interface GetFileComponentSetsResult extends CommonFigmaResponse {
  meta?: {
    component_sets: ComponentSetMetadata[];
    cursor: CursorDto;
  };
}

export interface GetComponentSetParams {
  /** The unique identifier of the component_set */
  key: string;
}
export interface GetComponentSetResult extends CommonFigmaResponse {
  meta?: ComponentSetMetadata;
}

export interface GetTeamStylesParams {
  team_id: string;
  /** Number of items in a paged list of results. Defaults to 30. */
  page_size?: number;
  /** Cursor indicating which id after which to start retrieving components for. Exclusive with before. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  after?: number;
  /** Cursor indicating which id before which to start retrieving components for. Exclusive with after. The cursor value is an internally tracked integer that doesn't correspond to any Ids */
  before?: number;
}
export interface GetTeamStylesResult extends CommonFigmaResponse {
  meta?: {
    styles: StyleMetadata[];
    cursor: CursorDto;
  };
}

export interface GetFileStylesParams {
  id: string;
}
export interface GetFileStylesResult extends CommonFigmaResponse {
  meta?: {
    styles: StyleMetadata[];
  };
}

export interface GetStyleParams {
  /** The unique identifier of the style */
  key: string;
}
export interface GetStyleResult extends CommonFigmaResponse {
  meta?: StyleMetadata;
}

// common types

export interface FileNode<Node extends AnyNode> {
  document: Node;
  components: Record<string, Component>;
  schemaVersion: number;
  styles: Record<string, Style>;
}

/** { nodeId -> rendered image url } */
export type ImagesDto = Record<string, string | null>;
export type CursorDto = Record<string, number>;

export interface FileKeyParams {
  /**
   * File ID (key) to export JSON from
   *
   * Can be found in url to file, eg:
   * https://www.figma.com/file/FILE_KEY/FILE_NAME
   */
  id: string;
}

export interface CommonFigmaResponse {
  err?: string;
  error?: boolean; // ???
  status?: number;
}
