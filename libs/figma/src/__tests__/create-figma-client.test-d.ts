import type { AnyFn } from '@neodx/std/shared';
import { describe, expectTypeOf, test } from 'vitest';
import type {
  AnyNode,
  Comment,
  CommonFigmaResponse,
  ComponentMetadata,
  ComponentSetMetadata,
  DocumentNode,
  FigmaApi,
  GetFileNodesResult,
  GetFileResult,
  GetImageFillsResult,
  ImagesDto,
  PostCommentResult,
  Project,
  ProjectFile,
  StyleMetadata,
  User,
  Version
} from '../core';
import {
  createFigmaClient,
  type FigmaClient,
  type FigmaClientFile,
  type FigmaClientTeam
} from '../create-figma-client.ts';
import type { GraphNode } from '../graph';

describe('createFigmaClient types', async () => {
  const client = await createFigmaClient();

  test('root API', () => {
    expectTypeOf(client).toMatchTypeOf<{
      __: {
        api: FigmaApi;
      };
      team: (id: string) => FigmaClientTeam;
      file: (id: string) => FigmaClientFile;
    }>();
    expectTypeOf(client.me()).resolves.toMatchTypeOf<User>();
    expectTypeOf(client.style('...')).resolves.toEqualTypeOf<StyleMetadata | undefined>();
    expectTypeOf(client.component('...')).resolves.toEqualTypeOf<ComponentMetadata | undefined>();
    expectTypeOf(client.componentSet('...')).resolves.toEqualTypeOf<
      ComponentSetMetadata | undefined
    >();
    expectTypeOf(client.projectFiles('...')).resolves.toEqualTypeOf<ProjectFile[]>();
  });

  test('File API', () => {
    const file = client.file('...');

    expectTypeOf(file).toMatchTypeOf<{
      id: string;
      figma: FigmaClient;
      asGraph: () => Promise<GraphNode<DocumentNode>>;

      raw: AnyFn;
      nodes: AnyFn;
      images: AnyFn;
      imageFills: AnyFn;
      styles: AnyFn;
      versions: AnyFn;
      comments: AnyFn;
      addComment: AnyFn;
      deleteComment: AnyFn;
      components: AnyFn;
      componentSets: AnyFn;
    }>();

    expectTypeOf(file.raw()).resolves.toEqualTypeOf<GetFileResult>();
    expectTypeOf(file.nodes({ ids: ['...'] })).resolves.toEqualTypeOf<
      GetFileNodesResult<AnyNode>
    >();
    expectTypeOf(file.images({ ids: ['...'], format: 'svg' })).resolves.toEqualTypeOf<ImagesDto>();
    expectTypeOf(
      file.imageFills({ ids: ['...'], format: 'svg' })
    ).resolves.toEqualTypeOf<GetImageFillsResult>();
    expectTypeOf(file.styles()).resolves.toEqualTypeOf<StyleMetadata[]>();
    expectTypeOf(file.versions()).resolves.toEqualTypeOf<Version[]>();
    expectTypeOf(file.comments()).resolves.toEqualTypeOf<Comment[]>();
    expectTypeOf(
      file.addComment({ client_meta: {} as any, message: '...' })
    ).resolves.toEqualTypeOf<PostCommentResult>();
    expectTypeOf(
      file.deleteComment({ comment_id: '123' })
    ).resolves.toEqualTypeOf<CommonFigmaResponse>();
    expectTypeOf(file.components()).resolves.toEqualTypeOf<ComponentMetadata[]>();
    expectTypeOf(file.componentSets()).resolves.toEqualTypeOf<ComponentSetMetadata[]>();
  });

  test('Team API', () => {
    const file = client.team('...');

    expectTypeOf(file).toMatchTypeOf<{
      id: string;
      figma: FigmaClient;

      styles: AnyFn;
      projects: AnyFn;
      components: AnyFn;
      componentSets: AnyFn;
    }>();

    expectTypeOf(file.styles()).resolves.toEqualTypeOf<StyleMetadata[]>();
    expectTypeOf(file.projects()).resolves.toEqualTypeOf<Project[]>();
    expectTypeOf(file.components()).resolves.toEqualTypeOf<ComponentMetadata[]>();
    expectTypeOf(file.componentSets()).resolves.toEqualTypeOf<ComponentSetMetadata[]>();
  });
});
