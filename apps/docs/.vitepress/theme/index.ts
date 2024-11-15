// https://vitepress.dev/guide/custom-theme
import { h } from 'vue';
import Theme from 'vitepress/theme';
import './style.css';
import { EnhanceAppContext } from 'vitepress';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';

import '@shikijs/vitepress-twoslash/style.css';

export default {
  ...Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(TwoslashFloatingVue);
  }
};
