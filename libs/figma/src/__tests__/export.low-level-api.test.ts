/* eslint-disable @typescript-eslint/require-array-sort-compare */
import { uniq } from '@neodx/std';
import { describe, expect, test } from 'vitest';
import type { FigmaApi } from '../create-figma-api';
import { collectDownloadable } from '../export/collect-downloadable';
import { collectExportable } from '../export/collect-exportable';
import { downloadExports } from '../export/download-exports';
import { getGraphNodeName } from '../utils';
import {
  createMockApi,
  createMockFetch,
  createMockNodes,
  testFigmaLogger,
  testFileIds,
  testGraphs
} from './testing-utils';

describe('export low-level API', async () => {
  describe('collect exportable', () => {
    test('should collect all components by default', () => {
      const exportable = collectExportable(testGraphs.weather, {});

      expect(exportable.map(item => item.id).sort()).toEqual(
        testGraphs.weather.registry.types.COMPONENT?.map(node => node.id).sort()
      );
    });

    test('should filter by componentSet', () => {
      const exportable = collectExportable(testGraphs.weather, { componentSet: 'Wind' });

      expect(exportable.every(node => node.type === 'COMPONENT')).toBe(true);
      expect(exportable.length).toBe(2);
    });

    test('should support multiple filter', () => {
      const exportable = collectExportable(testGraphs.weather, {
        componentSet: ['Wind', node => node.source.name.includes('Snow'), /Sun/]
      });
      const parents = exportable.map(
        exported => testGraphs.weather.registry.byId[exported.parentId!]
      );
      const parentsNames = uniq(parents.map(getGraphNodeName).sort());
      const exportableNames = uniq(exportable.map(getGraphNodeName).sort());

      expect(exportableNames).toEqual(['Color=Off', 'Color=On']);
      expect(exportable.every(node => node.type === 'COMPONENT')).toBe(true);
      expect(exportable.length).toBe(10);
      expect(parentsNames).toEqual([
        '32/Drizzle&Sun',
        '32/Rain&Sun',
        '32/Snow',
        '32/Sunny',
        '32/Wind'
      ]);
    });

    test('should filter by component', () => {
      const exportable = collectExportable(testGraphs.weather, {
        componentSet: ['Wind', node => node.source.name.includes('Snow'), /Sun/],
        component: 'Color=Off'
      });
      const exportableNames = uniq(exportable.map(getGraphNodeName).sort());

      expect(exportableNames).toEqual(['Color=Off']);
      expect(exportable.length).toBe(5);
    });
  });

  describe('get image urls', async () => {
    test('should return image urls', async () => {
      const { api, fetch } = createMockApi();
      const exports = collectExportable(testGraphs.weather);
      const items = await collectDownloadable({
        api,
        target: exports,
        fileId: testFileIds.weather,
        logger: testFigmaLogger,
        batching: 10
      });

      expect(fetch).toHaveBeenCalledTimes(Math.ceil(exports.length / 10));
      expect(items.map(item => item.node)).toEqual(exports);
    });

    test.each([
      [90, 3, 30],
      [90, 20, 5],
      [90, 1, 90]
    ])(`should batch %i items by %i in %i requests`, async (length, batching, expected) => {
      const { api, fetch } = createMockApi();
      const exports = createMockNodes(length, 'COMPONENT');
      const items = await collectDownloadable({
        api,
        target: exports,
        logger: testFigmaLogger,
        fileId: testFileIds.weather,
        batching
      });

      expect(fetch).toHaveBeenCalledTimes(expected);
      expect(items.length).toBe(length);
      expect(items.map(item => item.node)).toEqual(exports);
    });
  });

  test('should download content for all downloadable nodes and return it in the correct order', async () => {
    const fetch = createMockFetch(req => `content for ${new URL(req.url).searchParams.get('id')}`);
    const exports = createMockNodes(120, 'COMPONENT');
    const items = await collectDownloadable({
      api: {
        async getImage({ ids }) {
          return {
            images: Object.fromEntries(ids.map(id => [id, `https://foo.com/download?id=${id}`]))
          };
        }
      } as FigmaApi,
      target: exports,
      logger: testFigmaLogger,
      fileId: testFileIds.weather,
      batching: 50,
      concurrency: 10
    });
    const downloaded = await downloadExports({
      items,
      fetch,
      logger: testFigmaLogger,
      concurrency: 10
    });

    expect(items).toEqual(
      exports.map(node => ({
        node,
        url: `https://foo.com/download?id=${node.id}`
      }))
    );
    expect(downloaded).toEqual(
      items.map(item => ({
        node: item.node,
        content: `content for ${item.node.id}`
      }))
    );
  });
});
