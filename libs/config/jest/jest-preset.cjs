module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      require.resolve('@swc/jest'),
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            dynamicImport: true
          },
          target: 'es2022'
        }
      }
    ]
  },
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  extensionsToTreatAsEsm: ['.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  transformIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json', 'mjs'],
  passWithNoTests: true,
  displayName: 'jest',
  testEnvironment: 'node',
  testRunner: 'jest-circus/runner',
  testTimeout: 30000,
  resolver: require.resolve('./enhanced-resolver.cjs'),
  coverageReporters: ['html'],
  maxWorkers: 1
};
