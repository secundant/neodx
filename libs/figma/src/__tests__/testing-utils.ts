/* eslint-disable @typescript-eslint/require-array-sort-compare */
import { createRelativeUrl, fromLength, uniq } from '@neodx/std';
import { readFile } from 'node:fs/promises';
import { expect, vi } from 'vitest';
import type { AnyNode, GetFileResult, NodeType } from '../core';
import { createFigmaApi } from '../core';
import { createFileGraph, type GraphNode } from '../graph';
import { figmaLogger } from '../shared';
import { parseFileIdFromLink } from '../utils';

export const expectSameGraphNodesList = (left: GraphNode<any>[], right: GraphNode<any>[]) =>
  expect(getNodesIds(left)).toEqual(getNodesIds(right));
export const getNodesIds = (nodes: GraphNode<AnyNode>[]) =>
  uniq(nodes)
    .map(node => node.id)
    .sort();

export const testFileIds = {
  weather: parseFileIdFromLink(
    'https://www.figma.com/file/H9kVbqMwzIxh579BpXKZbj/Weather--Icons-Kit-(Community)?type=design&node-id=0-1'
  )
};
export const testFileResults = {
  weather: JSON.parse(
    await readFile(new URL('./get-file-weather.mock.json', import.meta.url), 'utf-8')
  ) as GetFileResult,
  simple: JSON.parse(
    await readFile(new URL('./get-file-simple.mock.json', import.meta.url), 'utf-8')
  ) as GetFileResult
};
export const testGraphs = {
  weather: createFileGraph('stub-weather', testFileResults.weather),
  simple: createFileGraph('stub-simple', testFileResults.simple)
};

export const testFigmaLogger = figmaLogger.fork({
  level: 'silent'
});

export const createMockNodes = (length: number, type: NodeType = 'COMPONENT') =>
  fromLength(
    length,
    i =>
      ({
        id: `id-${i}`,
        source: {
          id: `id-${i}`,
          name: `name-${i}`,
          type
        }
      }) as GraphNode<AnyNode>
  );

export const createMockApi = ({
  getResponseText
}: { getResponseText?: Parameters<typeof createMockFetch>[0] } = {}) => {
  const fetch = createMockFetch(getResponseText);

  return {
    fetch,
    api: createFigmaApi({
      personalAccessToken: 'test',
      log: testFigmaLogger,
      fetch
    })
  };
};
export const createMockFetch = (getText: (req: Request) => string = () => '{"test":"value"}') =>
  vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const response = new Response(getText(request), {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    await new Promise(resolve => setTimeout(resolve, 5 + Math.random() * 10));
    return response;
  });

// Single request check. Probably, will be replaced with some more advanced assertions
export const expectFetchCalled = (fetch: ReturnType<typeof createMockFetch>, path: string) => {
  expect(fetch).toHaveBeenCalledWith(
    createRelativeUrl(path, 'https://api.figma.com/v1/'),
    expect.anything()
  );
  fetch.mockClear();
};
