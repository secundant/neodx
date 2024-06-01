import { describe, expect, test } from 'vitest';
import { parseSvg } from '../core/parser.ts';

describe('parser', () => {
  const getParsedChildren = (input: string) => parseSvg(input).children;

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
          props: { stroke: '#818594', strokeLinecap: 'round', d: 'm9.5 11.5 6 2.545' },
          children: []
        },
        {
          name: 'path',
          props: { fill: '#6da544', d: 'm9.5 11.5 6 2.545' },
          children: []
        },
        {
          name: 'text',
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
      props: {
        xmlns: 'http://www.w3.org/2000/svg'
      },
      children: [
        {
          name: 'path',
          props: { stroke: '#818594', d: 'm9.5 11.5 6 2.545' },
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
        props: { stroke: '#818594', d: 'm9.5 11.5 6 2.545' },
        children: []
      },
      {
        name: 'text',
        props: { fill: '#6da544', x: '9.5', y: '11.5' },
        children: ['text']
      }
    ]);
  });

  test('should force camelCase in attributes', () => {
    const input = `
      <svg>
        <path aria-activedescendant="foo" aria-label="bar" xml:lang="en" systemLanguage="en" fill-rule="evenodd" clip-rule="evenodd" d="m9.5 11.5 6 2.545"/>
      </svg>
      `;

    expect(getParsedChildren(input)).toEqual([
      {
        name: 'path',
        props: {
          ariaActivedescendant: 'foo',
          ariaLabel: 'bar',
          'xml:lang': 'en',
          systemLanguage: 'en',
          fillRule: 'evenodd',
          clipRule: 'evenodd',
          d: 'm9.5 11.5 6 2.545'
        },
        children: []
      }
    ]);
  });

  test('should support other tags', () => {
    expect(
      parseSvg(
        `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><mask id="a"><circle cx="256" cy="256" r="256" fill="#fff"/></mask><g mask="url(#a)"><path fill="#eee" d="m0 0 8 22-8 23v23l32 54-32 54v32l32 48-32 48v32l32 54-32 54v68l22-8 23 8h23l54-32 54 32h32l48-32 48 32h32l54-32 54 32h68l-8-22 8-23v-23l-32-54 32-54v-32l-32-48 32-48v-32l-32-54 32-54V0l-22 8-23-8h-23l-54 32-54-32h-32l-48 32-48-32h-32l-54 32L68 0H0z"/><path fill="#0052b4" d="M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z"/><path fill="#d80027" d="M0 0v45l131 131h45L0 0zm208 0v208H0v96h208v208h96V304h208v-96H304V0h-96zm259 0L336 131v45L512 0h-45zM176 336 0 512h45l131-131v-45zm160 0 176 176v-45L381 336h-45z"/></g></svg>`
      )
    ).toEqual({
      name: 'svg',
      props: {
        xmlns: 'http://www.w3.org/2000/svg',
        width: '512',
        height: '512',
        viewBox: '0 0 512 512'
      },
      children: [
        {
          name: 'mask',
          props: {
            id: 'a'
          },
          children: [
            {
              name: 'circle',
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
          props: {
            mask: 'url(#a)'
          },
          children: [
            {
              name: 'path',
              props: {
                fill: '#eee',
                d: 'm0 0 8 22-8 23v23l32 54-32 54v32l32 48-32 48v32l32 54-32 54v68l22-8 23 8h23l54-32 54 32h32l48-32 48 32h32l54-32 54 32h68l-8-22 8-23v-23l-32-54 32-54v-32l-32-48 32-48v-32l-32-54 32-54V0l-22 8-23-8h-23l-54 32-54-32h-32l-48 32-48-32h-32l-54 32L68 0H0z'
              },
              children: []
            },
            {
              name: 'path',
              props: {
                fill: '#0052b4',
                d: 'M336 0v108L444 0Zm176 68L404 176h108zM0 176h108L0 68ZM68 0l108 108V0Zm108 512V404L68 512ZM0 444l108-108H0Zm512-108H404l108 108Zm-68 176L336 404v108z'
              },
              children: []
            },
            {
              name: 'path',
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
