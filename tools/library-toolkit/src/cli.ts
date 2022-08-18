import sade from 'sade';
import { createConfiguration } from './core/create-configuration';
import { build, watch } from './runner';

export function createCli(cwd: string) {
  return sade('library')
    .command('build')
    .action(async () => {
      const configuration = await createConfiguration(cwd, 'production');

      await build(configuration);
    })
    .command('watch')
    .action(async () => {
      const configuration = await createConfiguration(cwd, 'development');

      await watch(configuration);
    });
}
