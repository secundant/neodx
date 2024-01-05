import { concurrently, isTypeOfString, lazyValue, toArray } from '@neodx/std';
import type { ESLint } from 'eslint';
import { getVfsActions } from '../core/operations';
import { createVfsPlugin } from '../create-vfs-plugin';

export interface EsLintPluginApi {
  fix(path: string | string[]): Promise<void>;
  fixAll(): Promise<void>;
}

export interface EsLintPluginParams {
  fix?: boolean;
  auto?: boolean;
  logErrors?: boolean;
  logWarnings?: boolean;
  eslintParams?: ESLint.Options;
}

export function eslintPlugin({
  fix = true,
  auto = true,
  logErrors = true,
  logWarnings = false,
  eslintParams
}: EsLintPluginParams = {}) {
  return createVfsPlugin<EsLintPluginApi>('eslint', (vfs, { context, beforeApply }) => {
    const { fix: originalFix, fixAll: originalFixAll } = vfs;
    const getEsLint = lazyValue(async () => {
      const { ESLint } = await import('eslint');

      return new ESLint({
        overrideConfig: {
          env: {
            es6: true,
            node: true
          },
          parserOptions: {
            ecmaVersion: 2022
          }
        },
        ...eslintParams,
        fix,
        cwd: context.path
      });
    });

    vfs.fix = async (path: string | string[]) => {
      const lint = await getEsLint();
      const allResults = await concurrently(
        toArray(path),
        async path =>
          await lint.lintText(await vfs.read(path, 'utf-8'), { filePath: vfs.resolve(path) })
      );
      const results = allResults.flat();

      const errors = results.filter(result => result.fatalErrorCount > 0);
      const warnings = results.filter(result => result.fatalErrorCount > 0);
      const fatalErrors = results.filter(result => result.fatalErrorCount > 0);
      const formatter = await lint.loadFormatter('stylish');

      if (fatalErrors.length > 0) {
        context.log.error('ESLint fatal errors:%s', formatter.format(fatalErrors));
      }
      if (logErrors && errors.length > 0) {
        context.log.error('ESLint errors:%s', formatter.format(errors));
      }
      if (logWarnings && warnings.length > 0) {
        context.log.warn('ESLint warnings:%s', formatter.format(warnings));
      }

      await concurrently(
        results,
        async ({ filePath, fixableErrorCount, fixableWarningCount, output }) => {
          if (!isTypeOfString(output)) return;
          context.log.debug(
            'ESLint fix %d errors in %s',
            fixableErrorCount + fixableWarningCount,
            filePath
          );
          return await vfs.write(filePath, output);
        }
      );
      await originalFix?.(path);
    };

    vfs.fixAll = async () => {
      context.log.debug('ESLint - Fixing all changed files...');
      const changes = await getVfsActions(context, ['create', 'update']);

      await vfs.fix!(changes.map(change => change.path));
      await originalFixAll?.();
    };

    if (auto) {
      beforeApply(() => vfs.fixAll!());
    }

    return vfs;
  });
}
