import { bench, describe } from 'vitest';
import { exampleLogArgs, exampleObjects, loggers } from './shared';

function createBench(fn: (log: any) => void) {
  for (const [logName, log] of Object.entries(loggers.dummyNodeJson)) {
    bench(logName, () => {
      fn(log);
    });
  }
}

describe('compare - strings', () => {
  createBench(log => log.info('hello'));
});
describe('compare - printf - mixed simple', () => {
  createBench(log => log.info(...exampleLogArgs.printfMixedSimple));
});
describe('compare - printf - mixed complex', () => {
  createBench(log => log.info(...exampleLogArgs.printfMixedComplex));
});
describe('compare - simple objects', () => {
  createBench(log => log.info(exampleObjects.simple));
});
describe('compare - circular objects', () => {
  createBench(log => log.info(exampleObjects.circular));
});
describe('compare - simple objects with errors', () => {
  createBench(log => log.info(exampleObjects.simpleErrorWithMeta));
});
