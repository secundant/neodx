const { presets, configure } = require('eslint-kit');

module.exports = configure({
  presets: [presets.node({}), presets.imports({}), presets.typescript({}), presets.prettier({})]
});
