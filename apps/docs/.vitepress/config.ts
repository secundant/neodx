import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Neodx',
  description: 'Modern solutions for great DX',
  head: [
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['link', { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#710ab7' }],
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
    ['meta', { name: 'msapplication-TileColor', content: '#603cba' }],
    ['meta', { name: 'msapplication-config', content: '/browserconfig.xml' }],
    ['meta', { name: 'theme-color', content: '#ffffff' }]
  ],
  markdown: {
    codeTransformers: [transformerTwoslash()]
  },
  themeConfig: {
    logo: '/logo.png',
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
          { text: '@neodx/figma', link: '/figma/', activeMatch: '^/figma/' },
          { text: '@neodx/vfs', link: '/vfs/', activeMatch: '^/vfs/' },
          { text: '@neodx/glob', link: '/glob/', activeMatch: '^/glob/' }
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
          { text: 'Formatting', link: '/log/formatting' },
          { text: 'Metadata', link: '/log/metadata' },
          { text: 'Forked and child loggers', link: '/log/fork-and-child' },
          { text: 'Creating your own logger', link: '/log/building-your-own-logger' },
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
              { text: 'Vite', link: '/svg/setup/vite' },
              { text: 'Next.js', link: '/svg/setup/next' },
              { text: 'Webpack', link: '/svg/setup/webpack' },
              { text: 'Other', link: '/svg/setup/other' },
              { text: 'Node.js programmatic API', link: '/svg/setup/node' },
              { text: 'Storybook', link: '/svg/setup/storybook' }
            ]
          },
          {
            text: 'Guides',
            items: [
              { text: 'Group and hash sprites', link: '/svg/group-and-hash' },
              { text: 'Generate metadata', link: '/svg/metadata' },
              { text: 'Writing Icon component', link: '/svg/writing-icon-component' },
              { text: 'Colors reset', link: '/svg/colors-reset' },
              { text: 'Multicolored icons', link: '/svg/multicolored' },
              { text: 'SVG optimization', link: '/svg/optimization' },
              { text: 'SVG inlining', link: '/svg/inlining' }
            ]
          },
          {
            text: 'Integration',
            link: '/svg/integration/',
            items: [
              { text: 'React', link: '/svg/integration/react' },
              { text: 'Vue', link: '/svg/integration/vue' },
              { text: 'Svelte', link: '/svg/integration/svelte' },
              { text: 'Solid', link: '/svg/integration/solid' },
              { text: 'Figma', link: '/svg/integration/figma' },
              { text: 'Heroicons', link: '/svg/integration/heroicons' }
            ]
          },
          {
            text: 'Recipes',
            items: [
              { text: 'CDN Compatibility', link: '/svg/recipes/cdn-compatibility' },
              { text: 'Text alignment', link: '/svg/recipes/text-alignment' }
            ]
          },
          {
            text: 'API',
            collapsed: true,
            link: '/svg/api/',
            items: [
              { text: 'Overview', link: '/svg/api/' },
              { text: 'Builder', link: '/svg/api/builder' }
            ]
          },
          { text: 'Migration guide', link: '/svg/migration' },
          { text: 'FAQ', link: '/svg/faq' }
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
      },
      {
        text: '@neodx/vfs',
        collapsed: true,
        items: [
          { text: 'Getting started', link: '/vfs/' },
          { text: 'Extending', link: '/vfs/extending' },
          {
            text: 'Plugins',
            items: [
              { text: 'scan', link: '/vfs/plugins/scan' },
              { text: 'glob', link: '/vfs/plugins/glob' },
              { text: 'json', link: '/vfs/plugins/json' },
              { text: 'eslint', link: '/vfs/plugins/eslint' },
              { text: 'prettier', link: '/vfs/plugins/prettier' },
              { text: 'package.json', link: '/vfs/plugins/package-json' }
            ]
          },
          { text: 'Limitations', link: '/vfs/limitations' },
          {
            text: 'API',
            collapsed: true,
            items: [
              { text: 'createVfs', link: '/vfs/api/create-vfs' },
              { text: 'Plugins', link: '/vfs/api/plugins' },
              { text: 'Context', link: '/vfs/api/context' },
              { text: 'Backend', link: '/vfs/api/backend' }
            ]
          }
        ]
      },
      {
        text: '@neodx/glob',
        collapsed: true,
        items: [
          { text: 'Getting started', link: '/glob/' },
          { text: 'Writing your glob', link: '/glob/writing-your-glob' },
          { text: 'API', link: '/glob/api' }
        ]
      }
    ]
  }
});
