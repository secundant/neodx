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
          { text: 'Pretty printing', link: '/log/pretty-printing' },
          { text: 'JSON logs', link: '/log/json' },
          { text: 'Children and forks', link: '/log/child-and-fork' },
          { text: 'HTTP frameworks', link: '/log/http-frameworks' },
          { text: 'Creating your own logger', link: '/log/custom' }
        ]
      },
      {
        text: '@neodx/svg',
        collapsed: true,
        items: [
          { text: 'Getting started', link: '/svg/' },
          { text: 'Motivation', link: '/svg/motivation' },
          { text: 'Frameworks and bundlers', link: '/svg/frameworks-and-bundlers' },
          { text: 'Automatically reset colors', link: '/svg/colors-reset' }
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
