---
title: '@neodx/figma'
outline: [2, 3]
---

# {{ $frontmatter.title }}

The modern Figma integration tools, typed API, human-friendly files traversing, assets exporter, and more.

- Flexible optimized [Export API](./api/export/) - the simple but powerful way to automate your design system
  - [Exporting assets from file](recipes/export-file-assets.md)
  - [Exporting assets from published library components](./recipes/export-published-components.md)
- Fully Typed [Figma API](./api/figma-api.md) and [common helpers](./api/low-level/utils.md)
- Brilliant human-friendly Figma [document graph traversing](./recipes/traverse-figma-file.md)

## Installation

::: code-group

```bash [npm]
npm install -D @neodx/figma
```

```bash [yarn]
yarn add -D @neodx/figma
```

```bash [pnpm]
pnpm add -D @neodx/figma
```

:::

## Getting started

You can use the `@neodx/figma` in two ways:

- [Export API](./api/export/) CLI - built-in automated flow for exporting assets from Figma files or published library components.
- [Node.js API](./api/figma-api.md) - a set of functions that you can use to build your own custom Figma integration tools.

In this guide, we will use the [Export](./api/export/) CLI to export assets from Figma files.

### Personal access token

We are using the Figma API, so you need to provide a personal access token to access the API.

The token can be obtained from the [Figma account settings](https://www.figma.com/developers/api#access-tokens) (Figma > Help and Account > Account Settings > Personal Access Tokens).

You can provide the token via the `FIGMA_TOKEN` environment variable, the `--token` CLI argument, or the `token` option in the configuration file.

::: code-group

```bash [Environment variable]
FIGMA_TOKEN=xxxxx yarn figma export
```

```bash [CLI argument]
yarn figma export --token xxxxx
```

```js{3} [Configuration file (not recommended)]
// figma.config.js
module.exports = {
  token: 'xxxxx'
};
```

:::

### Configure your project

The simple config is just a file ID, output path and rules for collecting components (what exactly you want to export).

We're using the [cosmiconfig](https://www.npmjs.com/package/cosmiconfig) package to load the configuration file, so you can use any supported format:
`figma.config.js`, `.figmarc.cjs`, etc. (we recommend using JS files for possible future extensions).

`figma.config.js`:

```javascript
/**
 * @type {import('@neodx/figma').Configuration}
 */
module.exports = {
  export: {
    fileId: 'YOUR_FILE_ID_OR_LINK',
    output: 'assets/icons',
    collect: {
      target: [
        {
          // First of all - select the "Icons" page
          type: 'CANVAS',
          filter: 'Icons'
        },
        {
          // Then select all components with names that starts with "32/"
          type: 'COMPONENT',
          filter: /32\/.*/
        }
      ]
    }
  }
};
```
