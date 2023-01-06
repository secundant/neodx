const { presets, configure } = require('eslint-kit');

module.exports = configure({
  root: __dirname,
  presets: [presets.imports({}), presets.prettier({}), presets.node({})]
});
