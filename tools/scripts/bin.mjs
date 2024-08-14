import { generateFiles } from '@neodx/codegen';
import { createLogger } from '@neodx/log';
import { invariant, omit } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import devkit from '@nrwl/devkit';
import { $ } from 'execa';
import { join } from 'node:path';
import sade from 'sade';

const log = createLogger({
  name: 'neodx'
});
const rootDir = join(devkit.workspaceRoot, 'tools/scripts');
const commands = devkit.getPackageManagerCommand(devkit.detectPackageManager());
const vfs = createVfs(devkit.workspaceRoot);
const $$ = $({ stdio: 'inherit', cwd: devkit.workspaceRoot, all: true });

sade('neodx')
  .command('lib [name]')
  .option('name', 'Library name')
  .action(async name => {
    try {
      invariant(name, 'Example name is required');

      await generateFiles(vfs, join(rootDir, 'templates/lib'), `libs/${name}`, { name });
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
      await $$`nx build @neodx/${name}`;
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

    await generateFiles(vfs, join(rootDir, 'templates/example'), `apps/examples/${lib}/${name}`, {
      lib,
      name
    });
    await vfs.updateJson(`apps/examples/${lib}/${name}/package.json`, prev => ({
      ...prev,
      scripts: patchScripts(prev.scripts)
    }));
    await vfs.apply();
    await $$`${commands.install}`;
    // await $$`nx build @neodx/example-${lib}-${name}`;
  })
  .parse(process.argv);

const patchScripts = prev =>
  Object.fromEntries(
    Object.entries(prev).map(([key, value]) => [key, value.replace(/exit 0 \|\|/g, '').trim()])
  );
