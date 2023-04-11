const { presets, configure } = require('eslint-kit');

module.exports = configure({
  root: __dirname,
  presets: [presets.node({}), presets.imports({}), presets.typescript({}), presets.prettier({})]
});
