import { colors } from '@neodx/colors';
import * as process from 'process';
import { exampleLogArgs, exampleObjects, loggers } from './shared';

const stringifyArgs = (args: readonly unknown[]) =>
  args
    .map(arg => {
      switch (typeof arg) {
        case 'string':
          return `"${arg}"`;
        case 'object':
          return '{ ... object ... }';
        default:
          return String(arg);
      }
    })
    .join(', ');
const cases = [
  ['log.info("hello world")', log => log.info('hello world')],
  [
    'log.info({ a: 1, b: 2, c: 3 }, "hello world")',
    log => log.info({ a: 1, b: 2, c: 3 }, 'hello world')
  ],
  [
    `log.info(${stringifyArgs(exampleLogArgs.printfMixedSimple)})`,
    log => log.info(...exampleLogArgs.printfMixedSimple)
  ],
  [
    `log.info(${stringifyArgs(exampleLogArgs.printfMixedComplex)})`,
    log => log.info(...exampleLogArgs.printfMixedComplex)
  ],
  [
    `log.error({ err: new Error("hello world"), ... })`,
    log => log.error(exampleObjects.simpleErrorWithMeta)
  ]
] satisfies Array<[string, (log: any) => void]>;

for (const [name, run] of cases) {
  console.log(`${colors.bold(colors.cyanBright(name))}\n`);
  for (const [logName, logger] of Object.entries(loggers.nodeJson)) {
    process.stdout.write(`${colors.bold(colors.magenta(logName.padEnd(12)))}`);
    run(logger);
  }
  console.log('');
}
