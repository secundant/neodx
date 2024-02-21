/* eslint-disable @typescript-eslint/require-array-sort-compare */
import { identity, uniq } from '@neodx/std';
// eslint-disable-next-line import/no-unresolved
import { createTmpVfs } from '@neodx/vfs/testing';
import { describe, expect, test } from 'vitest';
import type { AnyNode, FigmaApi } from '../core';
import { createExportContext, downloadExportedAssets, resolveExportedAssets } from '../export';
import { fileGraphResolversMap, getGraphNodeDownloadableMeta } from '../export/export-file-assets';
import type { GraphNode } from '../graph';
import { collectNodes } from '../graph';
import { getGraphNodeName } from '../utils';
import {
  createMockApi,
  createMockFetch,
  createMockNodes,
  getNodesIds,
  testFigmaLogger,
  testGraphs
} from './testing-utils';

describe('export low-level API', async () => {
  describe('collect exportable', () => {
    test('should collect all components by default', () => {
      const exportable = collectNodes(testGraphs.weather, {});

      expect(exportable.map(item => item.id).sort()).toEqual(
        testGraphs.weather.registry.types.COMPONENT?.map(node => node.id).sort()
      );
    });

    test('should filter by componentSet', () => {
      const exportable = collectNodes(testGraphs.weather, {
        target: {
          type: 'COMPONENT_SET',
          filter: 'Wind'
        }
      });

      expect(exportable.every(node => node.type === 'COMPONENT')).toBe(true);
      expect(exportable.length).toBe(2);
    });

    test('should support multiple filter', () => {
      const exportable = collectNodes(testGraphs.weather, {
        target: {
          type: 'COMPONENT_SET',
          filter: ['Wind', node => node.source.name.includes('Snow'), /Sun/]
        }
      });
      const parents = exportable.map(
        exported => testGraphs.weather.registry.byId[exported.parentId!]!
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

    test('should support multiple extractor formats', () => {
      expect(
        getNodesIds(
          collectNodes(testGraphs.weather, {
            extract: ['FRAME', 'COMPONENT', 'RECTANGLE']
          })
        )
      ).toEqual(
        getNodesIds([
          ...(testGraphs.weather.registry.types.FRAME ?? []),
          ...(testGraphs.weather.registry.types.COMPONENT ?? []),
          ...(testGraphs.weather.registry.types.RECTANGLE ?? [])
        ])
      );
      expect(
        getNodesIds(
          collectNodes(testGraphs.weather, {
            extract: ['COMPONENT', identity, node => node.children.list]
          })
        )
      ).toEqual(
        getNodesIds([
          testGraphs.weather,
          ...testGraphs.weather.children.list,
          ...(testGraphs.weather.registry.types.COMPONENT ?? [])
        ])
      );
    });

    test('should filter by component', () => {
      const exportable = collectNodes(testGraphs.weather, {
        target: [
          {
            type: 'COMPONENT_SET',
            filter: ['Wind', node => node.source.name.includes('Snow'), /Sun/]
          },
          {
            type: 'COMPONENT',
            filter: 'Color=Off'
          }
        ]
      });
      const exportableNames = uniq(exportable.map(getGraphNodeName).sort());

      expect(exportableNames).toEqual(['Color=Off']);
      expect(exportable.length).toBe(5);
    });
  });

  describe('get image urls', async () => {
    const createImagesMockApi = async () => {
      const { api, fetch } = createMockApi();
      const mockApi = {
        ...api,
        getImage: async params => {
          await api.getImage(params);
          return {
            images: {}
          };
        }
      } as FigmaApi;
      const ctx = createExportContext({
        api: mockApi,
        vfs: await createTmpVfs(),
        log: testFigmaLogger
      });

      return {
        fetch,
        api: mockApi,
        ctx
      };
    };

    test('should return image urls', async () => {
      const { ctx, fetch } = await createImagesMockApi();
      const exports = collectNodes(testGraphs.weather);
      const items = await resolveExportedAssets({
        ctx,
        items: exports,
        batching: 10,
        getItemMeta: getGraphNodeDownloadableMeta
      });

      expect(fetch).toHaveBeenCalledTimes(Math.ceil(exports.length / 10));
      expect(items.map(item => item.value.id).sort()).toEqual(exports.map(node => node.id).sort());
    });

    test.each([
      [90, 3, 30],
      [90, 20, 5],
      [90, 1, 90]
    ])(`should batch %i items by %i in %i requests`, async (length, batching, expected) => {
      const { ctx, fetch } = await createImagesMockApi();
      const exports = createMockNodes(length, 'COMPONENT');
      const items = await resolveExportedAssets({
        ctx,
        items: exports,
        getItemMeta: getGraphNodeDownloadableMeta,
        batching
      });

      expect(fetch).toHaveBeenCalledTimes(expected);
      expect(items.length).toBe(length);
      expect(items.map(item => item.value.id).sort()).toEqual(exports.map(node => node.id).sort());
    });
  });

  test('should download content for all downloadable nodes and return it in the correct order', async () => {
    const exports = createMockNodes(120, 'COMPONENT');
    const ctx = createExportContext({
      api: {
        __: {
          fetch: createMockFetch(
            req => `content for ${new URL(req.url).searchParams.get('id')}`
          ) as any
        },
        async getImage({ ids }) {
          return {
            images: Object.fromEntries(ids.map(id => [id, `https://foo.com/download?id=${id}`]))
          };
        }
      } as FigmaApi,
      vfs: await createTmpVfs(),
      log: testFigmaLogger
    });
    const items = await resolveExportedAssets({
      ctx,
      items: exports,
      getItemMeta: getGraphNodeDownloadableMeta,
      batching: 50,
      concurrency: 10
    });
    const downloaded = await downloadExportedAssets({
      ctx,
      items,
      concurrency: 10
    });

    expect(items).toEqual(
      exports.map(node =>
        expect.objectContaining({
          id: node.id,
          url: `https://foo.com/download?id=${node.id}`
        })
      )
    );
    expect(downloaded).toEqual(
      items.map(item =>
        expect.objectContaining({
          value: item.value,
          content: `content for ${item.value.id}`
        })
      )
    );
  });

  test('should download multiple exports for same node in "export" resolving mode', async () => {
    const exportsSchema = [
      ['PNG', 1],
      ['PNG', 2],
      ['PNG', 3],
      ['JPG', 1],
      ['SVG', 1],
      ['PDF', 1]
    ] as const;
    const exportNodes = createMockNodes(27, 'COMPONENT').map(node => ({
      ...node,
      source: {
        ...node.source,
        exportSettings: exportsSchema.map(([format, scale]) => ({
          format,
          suffix: `${format} ${scale}x`,
          constraint: {
            type: 'SCALE',
            value: scale
          }
        }))
      }
    })) as GraphNode<AnyNode>[];
    const ctx = createExportContext({
      api: {
        __: {
          fetch: createMockFetch(req => {
            const { id, format, scale } = Object.fromEntries(new URL(req.url).searchParams);

            return `content for ${id} - ${format!.toLowerCase()} x${scale}`;
          }) as any
        },
        async getImage({ ids, format, scale }) {
          return {
            images: Object.fromEntries(
              ids.map(id => [
                id,
                `https://foo.com/download?id=${id}&format=${format}&scale=${scale}`
              ])
            )
          };
        }
      } as FigmaApi,
      vfs: await createTmpVfs(),
      log: testFigmaLogger
    });
    const items = await resolveExportedAssets({
      ctx,
      items: exportNodes,
      exportAs: 'export',
      resolversMap: fileGraphResolversMap,
      getItemMeta: getGraphNodeDownloadableMeta,
      batching: 15,
      concurrency: 5
    });
    const downloaded = await downloadExportedAssets({
      ctx,
      items,
      concurrency: 10
    });

    expect(downloaded.map(item => item.content).sort()).toEqual(
      exportNodes
        .flatMap(node =>
          exportsSchema.map(
            ([format, scale]) => `content for ${node.id} - ${format.toLowerCase()} x${scale}`
          )
        )
        .sort()
    );
  });
});
