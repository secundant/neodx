import type { JscTarget, Options } from '@swc/core';
import type { Configuration } from './create-configuration';

export function createSwcConfig({
  cwd,
  tsconfig,
  deps,
  settings: { sourceMap }
}: Configuration): Options {
  const jsx = deps.production.includes('react');

  return {
    cwd,
    sourceMaps: sourceMap,
    jsc: tsconfig
      ? {
          parser: {
            syntax: 'typescript',
            tsx: jsx,
            decorators: tsconfig.compilerOptions.experimentalDecorators,
            dynamicImport: true
          },
          externalHelpers: tsconfig.compilerOptions.importHelpers,
          // TODO Add mapping "compilerOptions.target" -> "jsc.target"
          target: (
            tsconfig.compilerOptions.target as string | undefined
          )?.toLowerCase() as JscTarget,
          baseUrl: tsconfig.compilerOptions.baseUrl,
          paths: tsconfig.compilerOptions.paths
            ? Object.fromEntries(
                Object.entries(tsconfig.compilerOptions.paths).map(([path, matches]) => [
                  path,
                  [matches[0]]
                ])
              )
            : undefined
        }
      : {
          parser: {
            syntax: 'ecmascript',
            jsx
          }
        }
  };
}
