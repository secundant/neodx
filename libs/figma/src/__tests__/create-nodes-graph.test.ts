import { keys, values } from '@neodx/std';
import { describe, expect, test } from 'vitest';
import { testFileResults, testGraphs } from './testing-utils';

describe('create-nodes-testGraphs.simple', async () => {
  test('should provide direct children', () => {
    expect(testGraphs.simple.children.list).toEqual([
      expect.objectContaining({ type: 'CANVAS' }),
      expect.objectContaining({ type: 'CANVAS' })
    ]);
  });

  test('registry should contain children', () => {
    const { registry, children } = testGraphs.simple;

    expect(registry.byId).toContain(children.byId);
    expect(registry.byId).toContain(children.list[0].children.byId);
    expect(children.list[0].registry.byId).toContain(children.list[0].children.byId);
    expect(children.list[0].registry.byId).toContain(
      children.list[0].children.list[0].children.byId
    );
  });

  test('registry should contain nested children', () => {
    const {
      registry,
      children: { list }
    } = testGraphs.simple;

    expect(registry.byId).toContain(Object.assign({}, ...list.map(node => node.registry.byId)));
  });

  test('registry should combine styles', () => {
    expect(testGraphs.simple.registry.styles).toContain(testGraphs.simple.children.list[0].styles);
    expect(testGraphs.simple.registry.styles).toContain(testGraphs.simple.children.list[1].styles);
    expect(testGraphs.simple.registry.styles).toContain(
      testGraphs.simple.children.list[0].registry.styles
    );
    expect(testGraphs.simple.registry.styles).toContain(
      testGraphs.simple.children.list[1].registry.styles
    );
    expect(keys(testGraphs.simple.registry.styles)).toEqual(
      expect.arrayContaining(keys(testFileResults.simple.styles))
    );
  });

  test('case: collect all texts', () => {
    expect(testGraphs.simple.registry.types.TEXT?.map(text => text.source.characters))
      .toMatchInlineSnapshot(`
      [
        "Text",
        "Text",
        "Text",
        "Hello",
      ]
    `);
  });

  test('case: collect all styles for specific nodes', () => {
    expect(
      testGraphs.simple.registry.types.COMPONENT?.map(component => ({
        name: component.source.name,
        styles: values(component.registry.styles).map(style => `${style.styleType}:${style.name}`)
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "name": "Rectangle",
          "styles": [
            "FILL:Red",
            "FILL:Blue",
            "EFFECT:drop shadow",
            "FILL:Green",
          ],
        },
      ]
    `);

    expect(
      testGraphs.simple.registry.types.TEXT?.map(text => ({
        name: text.source.name,
        styles: text.styles.map(style => `${style.styleType}:${style.name}`)
      }))
    ).toMatchInlineSnapshot(`
      [
        {
          "name": "Text",
          "styles": [
            "FILL:Red",
          ],
        },
        {
          "name": "Text",
          "styles": [
            "FILL:Green",
          ],
        },
        {
          "name": "Text",
          "styles": [
            "FILL:Green",
          ],
        },
        {
          "name": "Hello",
          "styles": [
            "TEXT:Body",
          ],
        },
      ]
    `);
  });
});
