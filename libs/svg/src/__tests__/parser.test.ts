import { describe, expect, test } from 'vitest';
import { formatSvg, formatSvgAsset, parseSvg } from '../core/parser.ts';
import { defineSymbolMeta } from '../core/shared.ts';

describe('parsing and formatting', () => {
  describe('parser', () => {
    const getParsedChildren = (input: string) => parseSvg(input).children;

    const defaultPathD = 'm9.5 11.5 6 2.545';
    test('should parse svg', () => {
      const input = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path stroke="#818594" stroke-linecap="round" d="m9.5 11.5 6 2.545"/>
        <path fill="#6da544" d="m9.5 11.5 6 2.545"/>
        <text fill="#6da544" x="9.5" y="11.5">text</text>
         <!-- comment -->
      </svg>
    `;

      expect(parseSvg(input)).toEqual({
        name: 'svg',
        parent: expect.anything(),
        props: {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '16',
          height: '16',
          fill: 'none',
          viewBox: '0 0 16 16'
        },
        children: [
          {
            name: 'path',
            parent: expect.anything(),
            props: { stroke: '#818594', 'stroke-linecap': 'round', d: defaultPathD },
            children: []
          },
          {
            name: 'path',
            parent: expect.anything(),
            props: { fill: '#6da544', d: defaultPathD },
            children: []
          },
          {
            name: 'text',
            parent: expect.anything(),
            props: { fill: '#6da544', x: '9.5', y: '11.5' },
            children: ['text']
          }
        ]
      });
    });

    test('should ignore !DOCTYPE', () => {
      const input = `
      <!DOCTYPE html>
      <svg xmlns="http://www.w3.org/2000/svg">
        <path stroke="#818594" d="m9.5 11.5 6 2.545"/>
      </svg>
    `;

      expect(parseSvg(input)).toEqual({
        name: 'svg',
        parent: expect.anything(),
        props: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        children: [
          {
            name: 'path',
            parent: expect.anything(),
            props: { stroke: '#818594', d: defaultPathD },
            children: []
          }
        ]
      });
    });

    test('should ignore xml declaration', () => {
      const input = `
      <?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg">
        <path stroke="#818594" d="m9.5 11.5 6 2.545"/>
      </svg>
    `;

      expect(parseSvg(input)).toEqual({
        name: 'svg',
        parent: expect.anything(),
        props: {
          xmlns: 'http://www.w3.org/2000/svg'
        },
        children: [
          {
            name: 'path',
            parent: expect.anything(),
            props: { stroke: '#818594', d: defaultPathD },
            children: []
          }
        ]
      });
    });

    test('should ignore comments', () => {
      const input = `
      <svg>
        <!-- comment -->
        <path stroke="#818594" d="m9.5 11.5 6 2.545">
          <!-- comment -->
        </path>
        <!-- comment 2 -->
        <text fill="#6da544" x="9.5" y="11.5">
          <!-- comment -->
          <!-- comment -->
          text
          <!-- comment -->
         </text>
      </svg>
    `;

      expect(getParsedChildren(input)).toEqual([
        {
          name: 'path',
          parent: expect.anything(),
          props: { stroke: '#818594', d: defaultPathD },
          children: []
        },
        {
          name: 'text',
          parent: expect.anything(),
          props: { fill: '#6da544', x: '9.5', y: '11.5' },
          children: ['text']
        }
      ]);
    });

    test('should remove data-* and aria-* attributes', () => {
      const input = `
      <svg>
        <path aria-activedescendant="foo" aria-label="bar" d="m9.5 11.5 6 2.545"/>
      </svg>
      `;

      expect(getParsedChildren(input)).toEqual([
        {
          name: 'path',
          parent: expect.anything(),
          props: {
            d: defaultPathD
          },
          children: []
        }
      ]);
    });

    test('should preserve attributes case', () => {
      const input = `
      <svg>
        <path xml:lang="en" systemLanguage="en" fill-rule="evenodd" clip-rule="evenodd" d="m9.5 11.5 6 2.545"/>
      </svg>
      `;

      expect(getParsedChildren(input)).toEqual([
        {
          name: 'path',
          parent: expect.anything(),
          props: {
            'xml:lang': 'en',
            systemLanguage: 'en',
            'fill-rule': 'evenodd',
            'clip-rule': 'evenodd',
            d: defaultPathD
          },
          children: []
        }
      ]);
    });

    test('should support complex svg structure', () => {
      const input = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
        <mask id="mask">
          <circle cx="256" cy="256" r="256" fill="#fff"/>
        </mask>
        <g mask="url(#mask)">
          <path fill="#0052b4" d="m0 0 256-256 256 256"/>
          <path fill="#d80027" d="m0 0 256-256 256 256"/>
        </g>
        <g mask="url(#mask)">
          <path fill="#333" d="m0 0 256-256 256 256"/>
        </g>
      </svg>
    `;

      expect(parseSvg(input)).toEqual({
        name: 'svg',
        parent: expect.anything(),
        props: {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '16',
          height: '16',
          fill: 'none',
          viewBox: '0 0 16 16'
        },
        children: [
          {
            name: 'mask',
            parent: expect.anything(),
            props: {
              id: 'mask'
            },
            children: [
              {
                name: 'circle',
                parent: expect.anything(),
                props: {
                  cx: '256',
                  cy: '256',
                  r: '256',
                  fill: '#fff'
                },
                children: []
              }
            ]
          },
          {
            name: 'g',
            parent: expect.anything(),
            props: {
              mask: 'url(#mask)'
            },
            children: [
              {
                name: 'path',
                parent: expect.anything(),
                props: {
                  fill: '#0052b4',
                  d: 'm0 0 256-256 256 256'
                },
                children: []
              },
              {
                name: 'path',
                parent: expect.anything(),
                props: {
                  fill: '#d80027',
                  d: 'm0 0 256-256 256 256'
                },
                children: []
              }
            ]
          },
          {
            name: 'g',
            parent: expect.anything(),
            props: {
              mask: 'url(#mask)'
            },
            children: [
              {
                name: 'path',
                parent: expect.anything(),
                props: {
                  fill: '#333',
                  d: 'm0 0 256-256 256 256'
                },
                children: []
              }
            ]
          }
        ]
      });
    });

    test('should support other tags', () => {
      expect(
        parseSvg(
          `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><mask id="a"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#a)"><path fill="#eee" d="m0 0 8 22-8 23v23l32 54-32 54v32l32 48-32 48v32l32 54-32 54v68l22-8 23 8h23l54-32 54 32h32l48-32 48 32h32l54-32 54 32h68l-8-22 8-23v-23l-32-54 32-54v-32l-32-48 32-48v-32l-32-54 32-54V0l-22 8-23-8h-23l-54 32-54-32h-32l-48 32-48-32h-32l-54 32L68 0H0z"/><path fill="#0052b4" d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z"/><path fill="#d80027" d="M0 0v45l131 131h45L0 0zm208 0v208H0v96h208v208h96V304h208v-96H304V0h-96zm259 0L336 131v45L512 0h-45zM176 336 0 512h45l131-131v-45zm160 0 176 176v-45L381 336h-45z"/></g></svg>`
        )
      ).toEqual({
        name: 'svg',
        parent: expect.anything(),
        props: {
          xmlns: 'http://www.w3.org/2000/svg',
          width: '512',
          height: '512',
          viewBox: '0 0 512 512'
        },
        children: [
          {
            name: 'mask',
            parent: expect.anything(),
            props: {
              id: 'a'
            },
            children: [
              {
                name: 'circle',
                parent: expect.anything(),
                props: {
                  cx: '256',
                  cy: '256',
                  r: '256',
                  fill: '#fff'
                },
                children: []
              }
            ]
          },
          {
            name: 'g',
            parent: expect.anything(),
            props: {
              mask: 'url(#a)'
            },
            children: [
              {
                name: 'path',
                parent: expect.anything(),
                props: {
                  fill: '#eee',
                  d: 'm0 0 8 22-8 23v23l32 54-32 54v32l32 48-32 48v32l32 54-32 54v68l22-8 23 8h23l54-32 54 32h32l48-32 48 32h32l54-32 54 32h68l-8-22 8-23v-23l-32-54 32-54v-32l-32-48 32-48v-32l-32-54 32-54V0l-22 8-23-8h-23l-54 32-54-32h-32l-48 32-48-32h-32l-54 32L68 0H0z'
                },
                children: []
              },
              {
                name: 'path',
                parent: expect.anything(),
                props: {
                  fill: '#0052b4',
                  d: 'M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z'
                },
                children: []
              },
              {
                name: 'path',
                parent: expect.anything(),
                props: {
                  fill: '#d80027',
                  d: 'M0 0v45l131 131h45L0 0zm208 0v208H0v96h208v208h96V304h208v-96H304V0h-96zm259 0L336 131v45L512 0h-45zM176 336 0 512h45l131-131v-45zm160 0 176 176v-45L381 336h-45z'
                },
                children: []
              }
            ]
          }
        ]
      });
    });
  });

  describe('formatter', () => {
    test('should format svg', () => {
      const input = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
        <path stroke="#818594" stroke-linecap="round" d="m9.5 11.5 6 2.545"/>
        <path fill="#6da544" d="m9.5 11.5 6 2.545"/>
        <text fill="#6da544" x="9.5" y="11.5">text</text>
         <!-- comment -->
      </svg>
    `;

      expect(formatSvg(parseSvg(input))).toMatchInlineSnapshot(
        `"<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="#818594" stroke-linecap="round" d="m9.5 11.5 6 2.545"></path><path fill="#6da544" d="m9.5 11.5 6 2.545"></path><text fill="#6da544" x="9.5" y="11.5">text</text></svg>"`
      );
    });

    test('should replay parsing results for simple svg', () => {
      const input = `
      <?xml version="1.0" encoding="UTF-8"?>
      <svg xmlns="http://www.w3.org/2000/svg"viewBox="0 0 16 16">
        <path stroke="#818594" stroke-linecap="round" d="m9.5 11.5 6 2.545"/>
      </svg>
    `;

      expect(parseSvg(input)).toEqual(parseSvg(formatSvg(parseSvg(input))));
    });

    test('should format svg as sprite', () => {
      const withParsed = (source: string) => [source, parseSvg(source)] as const;
      expect(
        formatSvgAsset({
          type: 'external',
          symbols: [
            defineSymbolMeta(
              'add',
              'add.svg',
              ...withParsed(
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM8 12a4 4 0 100-8 4 4 0 000 8z"/></svg>`
              )
            ),
            defineSymbolMeta(
              'close',
              'close.svg',
              ...withParsed(
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.45 37.65-2.1-2.1 6.4 6.4-2.1 2.1-6.4-6.4z"/></svg>`
              )
            ),
            defineSymbolMeta(
              'exit',
              'exit.svg',
              ...withParsed(
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.8 4.9h2.1l-2.1 2.1-2.1-2.1h2.2v-2.1h-2.1v2.1z"/></svg>`
              )
            )
          ],
          fileName: '...'
        })
      ).toMatchInlineSnapshot(
        `"<svg width="0" height="0"><symbol xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" id="add"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM8 12a4 4 0 100-8 4 4 0 000 8z"></path></symbol><symbol xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" id="close"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.45 37.65-2.1-2.1 6.4 6.4-2.1 2.1-6.4-6.4z"></path></symbol><symbol xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16" id="exit"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.8 4.9h2.1l-2.1 2.1-2.1-2.1h2.2v-2.1h-2.1v2.1z"></path></symbol></svg>"`
      );
    });
  });
});
