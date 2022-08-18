const { presets, configure } = require('eslint-kit');

module.exports = configure({
  presets: [presets.imports({}), presets.typescript({}), presets.prettier({}), presets.node({})]
});
