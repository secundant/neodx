import { generateFiles } from '@neodx/codegen';
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
      ...prev,
      scripts: {
        ...prev.scripts,
        lint: 'eslint .',
        typecheck: 'tsc --noEmit'
      }
    }));
    await vfs.applyChanges();
    await $$`${commands.install}`;
    await $$`nx build ${name}`;
  })
  .parse(process.argv);
