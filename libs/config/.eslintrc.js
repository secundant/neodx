const { presets, configure } = require('eslint-kit');

module.exports = configure({
  presets: [presets.imports({}), presets.prettier({}), presets.node({})]
});
