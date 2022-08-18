import chalk from 'chalk';
import { watch as rollupWatch } from 'rollup';
import type { Configuration } from '../core/create-configuration';
import { createContext } from './create-context';

export async function watch(configuration: Configuration) {
  const rollupContext = await createContext(configuration);

  console.log(chalk.blue(`Watching sources...`));

  for (const entry of rollupContext.entries) {
    const watcher = rollupWatch({
      ...entry.input,
      output: entry.output,
      watch: {
        exclude: 'node_modules/**',
        clearScreen: true
      }
    });

    watcher.on('event', event => {
      if (event.code === 'START') {
        // ...
      }
      if (event.code === 'ERROR') {
        console.error(event.error);
        // ...
      }
      if (event.code === 'END') {
        // ...
      }
    });
  }
}
