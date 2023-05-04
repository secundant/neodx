# @neodx/figma

The modern Figma API, types, human-friendly graph builder, exporter, and more.

<div align="center">
  <a href="https://www.npmjs.com/package/@neodx/log">
    <img src="https://img.shields.io/npm/v/@neodx/figma.svg" alt="npm" />
  </a>
  <img src="https://img.shields.io/npm/l/@neodx/figma.svg" alt="license"/>
</div>

> **Warning**
> This project is still in the development stage, under 0.x.x version breaking changes can be introduced in any release, but I'll try to make them loud.

## Motivation

I've been looking for a stable maintaining Figma API with built-in high-level structures, abstractions and common features for implementing high-level tools for Figma.
But I didn't find anything that would suit me, [figma-js](https://github.com/jemgold/figma-js) and [figma-api](https://github.com/didoo/figma-api) both are not maintained, low-level API only and depends on the axios library, which is not suitable for me.

Next, I found [figma-transformer](https://github.com/figma-tools/figma-transformer), nice project for creating a human-friendly data structure, but it's not a full-featured, not maintained, and written in **very** unsafe and untyped style.

So I decided to create my own Figma API, which will be:

- **Fully typed** with TypeScript
- **Safe** and **stable** as possible without strict value validation (via `zod`, `runtypes` or something like that)
- Built on top of the Web API (fetch) and **not** depends on any third-party libraries
- Be **consistent** with the official Figma API
- Have **high-level** abstractions and features for convenient work with Figma API
- etc.

In other words, the holistic high-level well-featured instrument.

## Installation

```bash
# yarn
yarn add @neodx/figma
# npm
npm install @neodx/figma
# pnpm
pnpm install @neodx/figma
```

## Getting started

```ts
import { createFigmaApi, parseFileIdFromLink, createFileGraph } from '@neodx/figma';

const figma = createFigmaApi({
  personalAccessToken: 'xxx'
  // or
  // accessToken: 'my-oauth-token'
});
// Load file by file key
const myFile = await figma.getFile({
  id: parseFileIdFromLink('https://www.figma.com/file/xxx/yyy')
});
// Create well-typed human-friendly graph for convenient access to all file data
const graph = createFileGraph(myFile);

const allTexts = graph.registry.types.TEXT.map(text => text.source.characters);
```

## API

## Inspiration

This project got inspiration about API design and some features from the following projects:

- [figma-js](https://github.com/jemgold/figma-js) -
- [figma-api](https://github.com/didoo/figma-api)
- [figma-api-exporter](https://github.com/slawomirkolodziej/figma-api-exporter)
- [figma-transformer](https://github.com/figma-tools/figma-transformer)

## License

[MIT](https://github.com/secundant/neodx/blob/main/LICENSE)
