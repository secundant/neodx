import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Neodx',
  description: 'Modern solutions for great DX',
  themeConfig: {
    socialLinks: [{ icon: 'github', link: 'https://github.com/secundant/neodx' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Dmitry Remezov'
    },
    nav: [
      {
        text: 'Packages',
        activeMatch: '^/(log|svg|figma)/',
        items: [
          { text: '@neodx/log', link: '/log/', activeMatch: '^/log/' },
          { text: '@neodx/svg', link: '/svg/', activeMatch: '^/svg/' },
          { text: '@neodx/figma', link: '/figma/', activeMatch: '^/figma/' }
        ]
      }
    ],

    sidebar: [
      {
        text: '@neodx/log',
        collapsed: true,
        items: [
          { text: 'Getting started', link: '/log/' },
          { text: 'Motivation', link: '/log/motivation' },
          { text: 'Children and forks', link: '/log/child-and-fork' },
          {
            text: 'Targets',
            items: [
              { text: 'JSON logs', link: '/log/targets/json' },
              { text: 'Pretty format', link: '/log/targets/pretty' }
            ]
          },
          {
            text: 'Frameworks',
            link: '/log/frameworks/',
            items: [
              { text: 'Express', link: '/log/frameworks/express' },
              { text: 'Koa', link: '/log/frameworks/koa' },
              { text: 'Node.js http', link: '/log/frameworks/http' }
            ]
          },
          { text: 'Creating your own logger', link: '/log/building-your-own-logger' },
          {
            text: 'API',
            collapsed: true,
            items: [
              { text: 'createLogger', link: '/log/api/create-logger' },
              { text: 'createLoggerFactory', link: '/log/api/create-logger-factory' },
              { text: 'logger', link: '/log/api/logger' },
              { text: 'printf', link: '/log/api/printf' },
              { text: 'readArguments', link: '/log/api/read-arguments' },
              { text: '@neodx/log/http', link: '/log/api/http' }
            ]
          }
        ]
      },
      {
        text: '@neodx/svg',
        collapsed: true,
        items: [
          { text: 'Getting started', link: '/svg/' },
          { text: 'Motivation', link: '/svg/motivation' },
          {
            text: 'Setup',
            link: '/svg/setup/',
            items: [
              { text: 'Vite', link: '/svg/setup/vite.md' },
              { text: 'Next', link: '/svg/setup/next.md' },
              { text: 'Webpack', link: '/svg/setup/webpack.md' },
              { text: 'Other', link: '/svg/setup/other' }
            ]
          },
          {
            text: 'Guides',
            items: [
              { text: 'Group and hash sprites', link: '/svg/group-and-hash' },
              { text: 'Generate metadata', link: '/svg/metadata' },
              { text: '✨ Writing Icon component', link: '/svg/writing-icon-component' },
              { text: 'Automatically reset colors', link: '/svg/colors-reset' },
              { text: 'Working with multicolored', link: '/svg/multicolored' }
            ]
          },
          {
            text: 'API',
            collapsed: true,
            link: '/svg/api/',
            items: [
              { text: 'createSpritesBuilder', link: '/svg/api/create-sprites-builder' },
              { text: 'createWatcher', link: '/svg/api/create-watcher' },
              { text: 'buildSprites', link: '/svg/api/build-sprites' },
              {
                text: 'Plugins API',
                collapsed: true,
                items: [
                  { text: 'resetColors', link: '/svg/api/plugins/reset-colors' },
                  {
                    text: 'metadata',
                    link: '/svg/api/plugins/metadata'
                  },
                  { text: 'svgo', link: '/svg/api/plugins/svgo' }
                ]
              }
            ]
          }
        ]
      },
      {
        text: '@neodx/figma',
        collapsed: true,
        items: [
          { text: 'Getting started', link: '/figma/' },
          { text: 'Motivation', link: '/figma/motivation' },
          {
            text: 'Recipes',
            items: [
              { text: 'Export File Assets', link: '/figma/recipes/export-file-assets' },
              {
                text: 'Export Published Components',
                link: '/figma/recipes/export-published-components'
              },
              { text: 'Traverse Figma File', link: '/figma/recipes/traverse-figma-file' }
            ]
          },
          {
            text: 'API',
            items: [
              { text: 'Figma API', link: '/figma/api/figma-api' },
              {
                text: 'Export API',
                link: '/figma/api/export/',
                collapsed: true,
                items: [
                  { text: 'Export File Assets', link: '/figma/api/export/export-file-assets' },
                  {
                    text: 'Export Published Components',
                    link: '/figma/api/export/export-published-components'
                  }
                ]
              }
            ]
          },
          {
            text: 'Node API',
            collapsed: true,
            items: [
              {
                text: 'collectNodes',
                link: '/figma/api/low-level/collect-nodes'
              },
              {
                text: 'createFileGraph',
                link: '/figma/api/low-level/create-file-graph'
              },
              {
                text: 'Common utilities',
                link: '/figma/api/low-level/utils'
              }
            ]
          },
          {
            text: 'Low-level Export API',
            collapsed: true,
            items: [
              {
                text: 'createExportContext',
                link: '/figma/api/low-level/create-export-context'
              },
              {
                text: 'resolveExportedAssets',
                link: '/figma/api/low-level/resolve-exported-assets'
              },
              {
                text: 'downloadExportedAssets',
                link: '/figma/api/low-level/download-exported-assets'
              },
              {
                text: 'writeDownloadedAssets',
                link: '/figma/api/low-level/write-downloaded-assets'
              }
            ]
          }
        ]
      }
    ]
  }
});
