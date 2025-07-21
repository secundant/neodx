import { describe, expect, test } from 'vitest';
import { createFigmaClient, type FigmaClientParams } from '../create-figma-client.ts';
import { createMockApi, expectFetchCalled } from './testing-utils.ts';

export async function createTestFigmaClient(params: FigmaClientParams = {}) {
  const { api, fetch } = createMockApi();
  const figma = await createFigmaClient({
    api,
    ...params
  });

  return {
    figma,
    fetch,
    api
  };
}

describe('createFigmaClient', () => {
  test('scoped APIs should give access to client and current context', async () => {
    const { figma } = await createTestFigmaClient();
    const file = figma.file('123');
    const team = figma.team('456');

    expect(file.figma).toBe(figma);
    expect(team.figma).toBe(figma);
    expect(file.id).toBe('123');
    expect(team.id).toBe('456');
  });

  test('should provide team APIs', async () => {
    const { figma, fetch } = await createTestFigmaClient();
    const team = figma.team('456');

    expect(team.figma).toBe(figma);
    expect(team.id).toBe('456');
    await team.styles();
    expectFetchCalled(fetch, `teams/${team.id}/styles`);
    await team.styles({ after: 1, before: 2, page_size: 3 });
    expectFetchCalled(fetch, `teams/${team.id}/styles?after=1&before=2&page_size=3`);
    await team.projects();
    expectFetchCalled(fetch, `teams/${team.id}/projects`);
    await team.components();
    expectFetchCalled(fetch, `teams/${team.id}/components`);
    await team.componentSets();
    expectFetchCalled(fetch, `teams/${team.id}/component_sets`);
  });

  test('should provide file APIs', async () => {
    const { figma } = await createTestFigmaClient();
    const file = figma.file('123');

    expect(file).toEqual({
      figma,
      id: '123',
      asGraph: expect.any(Function),
      raw: expect.any(Function),
      nodes: expect.any(Function),
      images: expect.any(Function),
      imageFills: expect.any(Function),
      comments: expect.any(Function),
      versions: expect.any(Function),
      components: expect.any(Function),
      componentSets: expect.any(Function),
      styles: expect.any(Function),
      addComment: expect.any(Function),
      deleteComment: expect.any(Function)
    });
  });

  test.each([
    ['raw', '/files/123'],
    ['nodes', '/files/123/nodes'],
    ['images', '/images/123'],
    ['imageFills', '/files/123/images'],
    ['comments', '/files/123/comments'],
    ['versions', '/files/123/versions'],
    ['components', '/files/123/components'],
    ['componentSets', '/files/123/component_sets'],
    ['styles', '/files/123/styles']
  ])('should call file.%s as /files/:id%s', async (method, path) => {
    const { figma, fetch } = await createTestFigmaClient();
    const file = figma.file('123');

    await (file as any)[method]();
    expectFetchCalled(fetch, path);
  });
});
