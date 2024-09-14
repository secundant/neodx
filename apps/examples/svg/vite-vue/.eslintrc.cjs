const { presets, configure } = require('eslint-kit');

module.exports = configure({
  root: __dirname,
  presets: [
    presets.node(),
    presets.vue(),
    presets.imports(),
    presets.typescript(),
    presets.prettier()
  ],
  extend: {
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
});
