import { generateFiles } from '@neodx/codegen';
import { omit } from '@neodx/std';
import { createVfs } from '@neodx/vfs';
import devkit from '@nrwl/devkit';
import { $ } from 'execa';
import { join } from 'node:path';
import sade from 'sade';

const rootDir = join(devkit.workspaceRoot, 'tools/scripts');

sade('neodx')
  .command('lib [name]')
  .option('name', 'Library name')
  .action(async name => {
    if (!name) return;

    const $$ = $({ stdio: 'inherit', cwd: devkit.workspaceRoot, all: true });
    const vfs = createVfs(devkit.workspaceRoot);
    const commands = devkit.getPackageManagerCommand(devkit.detectPackageManager());

    await generateFiles(vfs, join(rootDir, 'templates/lib'), `libs/${name}`, { name });
    await vfs.updateJson(`libs/${name}/package.json`, prev => ({
      ...omit(prev, ['private', 'publishConfig']),
      scripts: Object.fromEntries(
        Object.entries(prev.scripts).map(([key, value]) => [
          key,
          value.replace(/exit 0 \|\|/g, '').trim()
        ])
      )
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
    await vfs.applyChanges();
    await $$`${commands.install}`;
    await $$`nx build ${name}`;
  })
  .parse(process.argv);
