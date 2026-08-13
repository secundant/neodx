import { generateFiles } from '@neodx/codegen';
import { createLogger } from '@neodx/log';
import { invariant, omit } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import { $ } from 'execa';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sade from 'sade';

const log = createLogger({ name: 'neodx' });
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const commands = { install: 'yarn' };
const vfs = createVfs(workspaceRoot);
const selfVfs = vfs.child('tools/scripts');
const $$ = $({ stdio: 'inherit', cwd: workspaceRoot, all: true });

sade('neodx')
  .command('lib [name]')
  .option('name', 'Library name')
  .action(async name => {
    try {
      invariant(name, 'Example name is required');

      await generateFiles(vfs, selfVfs.resolve('templates/lib'), `libs/${name}`, { name });
      await vfs.updateJson(`libs/${name}/package.json`, prev => ({
        ...omit(prev, ['private', 'publishConfig']),
        scripts: patchScripts(prev.scripts)
      }));
      await vfs.updateJson('tsconfig.base.json', prev => ({
        ...prev,
        compilerOptions: {
          ...prev.compilerOptions,
          paths: {
            ...prev.compilerOptions.paths,
            [`@neodx/${name}`]: [`libs/${name}/src/index.ts`]
          }
        }
      }));
      await vfs.apply();
      await $$`${commands.install}`;
      await $$`vp run @neodx/${name}#pack`;
    } catch (error) {
      log.error(error);
      process.exit(1);
    }
  })
  .command('example [lib] [name]')
  .option('lib', 'Library name')
  .option('name', 'Example name')
  .action(async (lib, name) => {
    const allLibNames = await vfs.readDir('libs');

    invariant(lib, 'Example lib is required');
    invariant(
      allLibNames.includes(lib),
      `Unknown lib "${lib}", available libs: ${allLibNames.join(', ')}`
    );
    invariant(name, 'Example name is required');

    await generateFiles(vfs, selfVfs.resolve('templates/example'), `apps/examples/${lib}/${name}`, {
      lib,
      name
    });
    await vfs.updateJson(`apps/examples/${lib}/${name}/package.json`, prev => ({
      ...prev,
      scripts: patchScripts(prev.scripts)
    }));
    await vfs.apply();
    await $$`${commands.install}`;
    // await $$`vp -C apps/examples/${lib}/${name} build`;
  })
  .parse(process.argv);

const patchScripts = prev =>
  Object.fromEntries(
    Object.entries(prev).map(([key, value]) => [key, value.replace(/exit 0 \|\|/g, '').trim()])
  );
