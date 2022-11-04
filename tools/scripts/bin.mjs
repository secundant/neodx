import sade from 'sade';
import { FsTree, generateFiles } from '@neodx/codegen';
import { detectPackageManager, getPackageManagerCommand, workspaceRoot } from '@nrwl/devkit';
import { join } from 'node:path';
import { execSync } from 'child_process';

const rootDir = join(workspaceRoot, 'tools/scripts');

sade('neodx')
  .command('lib [name]')
  .option('name', 'Library name')
  .action(async name => {
    const tree = new FsTree(workspaceRoot);
    const commands = getPackageManagerCommand(detectPackageManager());

    if (!name) return;
    await generateFiles(tree, join(rootDir, 'templates/lib'), `libs/${name}`, { name });
    await tree.applyChanges();
    execSync(commands.install, {
      stdio: 'inherit'
    });
    execSync(commands.run(`nx build ${name}`, ''), {
      stdio: 'inherit'
    });
  })
  .parse(process.argv);
