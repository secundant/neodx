import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Neodx',
  description: 'Modern solutions for great DX',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
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
          { text: 'Frameworks and bundlers', link: '/svg/frameworks-and-bundlers' }
        ]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/secundant/neodx' }]
  }
});
