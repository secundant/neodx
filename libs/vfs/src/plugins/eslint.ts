import { createTaskRunner } from '@neodx/internal/experimental';
import { formatList } from '@neodx/internal/log';
import { createVfsNpmApi } from '@neodx/internal/npm';
import { compact, concurrently, isTypeOfString, lazyValue, toArray } from '@neodx/std';
import type { ESLint } from 'eslint';
import { extname } from 'pathe';
import { displayPath, getVfsActions } from '../core/operations';
import { createVfsPlugin } from '../create-vfs-plugin';
import { createVfsPackageJsonFileApi } from './package-json.ts';

export interface EsLintPluginApi {
  /** Fix ESLint issues in the given path(s) */
  fix(path: string | string[]): Promise<void>;
  /** Fix ESLint issues in all changed files */
  fixAll(): Promise<void>;
}

export interface EsLintPluginParams {
  /**
   * @see ESLint.Options.fix
   * @default true
   */
  fix?: boolean;
  /**
   * Should fix all issues on apply?
   * @default true
   */
  auto?: boolean;
  /**
   * Should log errors to the console?
   * @default true
   */
  logErrors?: boolean;
  /**
   * Should log warnings to the console?
   * @default false
   */
  logWarnings?: boolean;
  /**
   * Additional ESLint options
   * @see ESLint.Options
   */
  eslintParams?: ESLint.Options;
}

export function eslint({
  fix = true,
  auto = true,
  logErrors = true,
  logWarnings = false,
  eslintParams
}: EsLintPluginParams = {}) {
  return createVfsPlugin<EsLintPluginApi>('eslint', (vfs, { context, beforeApply }) => {
    const { fix: originalFix, fixAll: originalFixAll } = vfs;
    const npm = createVfsNpmApi(vfs);
    const getEsLint = lazyValue(async () => {
      const { ESLint } = await import('eslint');

      return new ESLint({
        useEslintrc: true,
        overrideConfig: {
          env: {
            es6: true,
            node: true
          },
          parserOptions: {
            ecmaVersion: 2022,
            sourceType: 'module'
          }
        },
        ...eslintParams,
        fix,
        cwd: context.path
      });
    });
    const log = context.log.child('eslint');
    const { task } = createTaskRunner({ log });

    vfs.fix = task(
      'fix',
      async (path: string | string[]) => {
        const lint = await getEsLint();
        const allResults = await concurrently(toArray(path), async path => {
          const workspaceRoot = await npm.tryFindWorkspaceRoot();

          if (!workspaceRoot) {
            log.debug('Skipping %s, because it is not in a workspace', displayPath(context, path));
            return null;
          }
          const pkg = createVfsPackageJsonFileApi(vfs, vfs.resolve(workspaceRoot, 'package.json'));

          if (!(await pkg.hasDependency('eslint'))) {
            log.debug(
              'Skipping %s, because it has no eslint dependency',
              displayPath(context, path)
            );
            return null;
          }
          if (!(await vfs.isFile(path))) {
            log.debug('Skipping %s, because it is not a file', displayPath(context, path));
            return null;
          }
          if (await lint.isPathIgnored(path)) {
            log.debug('Skipping %s, because it is ignored', displayPath(context, path));
            return null;
          }
          if (!allSourceExtensions.includes(extname(path))) {
            log.debug('Skipping %s, because it is not a source file', displayPath(context, path));
            return null;
          }
          return await lint.lintText(await vfs.read(path, 'utf-8'), {
            filePath: vfs.resolve(path)
          });
        });
        const results = compact(allResults.flat());

        const errors = results.filter(result => result.fatalErrorCount > 0);
        const warnings = results.filter(result => result.fatalErrorCount > 0);
        const fatalErrors = results.filter(result => result.fatalErrorCount > 0);
        const formatter = await lint.loadFormatter('stylish');

        if (fatalErrors.length > 0) {
          log.error('ESLint fatal errors:%s', formatter.format(fatalErrors));
        }
        if (logErrors && errors.length > 0) {
          log.error('ESLint errors:%s', formatter.format(errors));
        }
        if (logWarnings && warnings.length > 0) {
          log.warn('ESLint warnings:%s', formatter.format(warnings));
        }

        await concurrently(
          results.filter(it => isTypeOfString(it.output)),
          async ({ filePath, output }) => await vfs.write(filePath, output!)
        );
        await originalFix?.(path);
      },
      {
        mapSuccessMessage: (_, path) =>
          `${displayPath(context, '.')}(${formatList(toArray(path).map(context.relative))}) fixed`
      }
    );

    vfs.fixAll = task(
      'fix all',
      async () => {
        log.debug('Fixing all ESLint issues in changed files...');
        const changes = await getVfsActions(context, ['create', 'update']);

        await vfs.fix!(changes.map(change => change.path));
        await originalFixAll?.();
      },
      {
        mapSuccessMessage: () => 'fixed all changed files'
      }
    );

    if (auto) {
      beforeApply(() => vfs.fixAll!());
    }

    return vfs;
  });
}

const allSourceExtensions = ['js', 'ts'].flatMap(ext => [
  `.${ext}`,
  `.c${ext}`,
  `.m${ext}`,
  `.${ext}x`
]);
