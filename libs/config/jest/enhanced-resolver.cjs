'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const path_1 = require('path');
const ts = require('typescript');
const fs = require('fs');
const { builtinModules } = require('node:module');

/**
 * Custom resolver which will respect package exports (until Jest supports it natively
 * by resolving https://github.com/facebook/jest/issues/9771)
 */
const enhancedResolver = require('enhanced-resolve').create.sync({
  conditionNames: ['require', 'node', 'default'],
  extensions: ['.js', '.json', '.node', '.ts', '.tsx']
});

const toRegExpPart = ext => (ext instanceof RegExp ? ext.source : escapeString(ext));
const escapeString = value => value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d');
const BUILTIN_MODULES = [
  /node:.*/,
  ...builtinModules.filter(x => !/^_|^(internal|v8|node-inspect)\/|\//.test(x)).sort()
];
const externalPredicate = new RegExp(`^(${BUILTIN_MODULES.map(toRegExpPart).join('|')})($|/)`);

function getCompilerSetup(rootDir) {
  const tsConfigPath =
    ts.findConfigFile(rootDir, ts.sys.fileExists, 'tsconfig.test.json') ||
    ts.findConfigFile(rootDir, ts.sys.fileExists, 'tsconfig.json');

  if (!tsConfigPath) {
    console.error(
      `Cannot locate a tsconfig.spec.json. Please create one at ${rootDir}/tsconfig.spec.json`
    );
  }
  const readResult = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
  const config = ts.parseJsonConfigFileContent(
    readResult.config,
    ts.sys,
    path_1.dirname(tsConfigPath)
  );
  const compilerOptions = config.options;
  const host = ts.createCompilerHost(compilerOptions, true);
  return { compilerOptions, host };
}
let compilerSetup;

if (
  process.argv[1].includes('jest-worker') ||
  (process.argv.length >= 4 && process.argv[3].split(':')[1] === 'test')
) {
  const root = path_1.join(__dirname, '..', 'tmp', 'unit');
  try {
    if (!fs.existsSync(root)) {
      fs.mkdirSync(root);
    }
  } catch (error) {}
  process.env.NX_WORKSPACE_ROOT_PATH = root;
}

module.exports = function jestEnhancedResolver(path, options) {
  if (path === 'jest-sequencer-@jest/test-sequencer') return;
  const ext = path_1.extname(path);
  if (ext === '.css' || ext === '.scss' || ext === '.sass' || ext === '.less' || ext === '.styl') {
    return require.resolve('identity-obj-proxy');
  }
  // Try to use the defaultResolver
  try {
    // Global modules which must be resolved by defaultResolver
    if (externalPredicate.test(path)) {
      return options.defaultResolver(path, options);
    }

    return enhancedResolver(options.basedir, path);
  } catch (error) {
    // Fallback to using typescript
    compilerSetup = compilerSetup || getCompilerSetup(options.rootDir);
    const { compilerOptions, host } = compilerSetup;

    return ts.resolveModuleName(path, options.basedir, compilerOptions, host).resolvedModule
      .resolvedFileName;
  }
};
