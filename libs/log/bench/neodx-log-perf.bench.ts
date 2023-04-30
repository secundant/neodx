import { bench, describe } from 'vitest';
import { exampleLogArgs, exampleObjects, LOG_METHODS, loggers } from './shared';

describe('json target - methods performance', () => {
  for (const method of LOG_METHODS) {
    bench(`method:${method}`, () => {
      loggers.dummyNodeJson.neodx[method]('hello');
    });
  }
});

describe('json target - printf', () => {
  bench('string', () => {
    loggers.dummyNodeJson.neodx.info('hello %s', 'world');
  });
  bench('number', () => {
    loggers.dummyNodeJson.neodx.info('hello %d', 42);
  });
  bench('simple json', () => {
    loggers.dummyNodeJson.neodx.info('hello %j', exampleObjects.simple);
  });
  bench('circular json', () => {
    loggers.dummyNodeJson.neodx.info('hello %j', exampleObjects.circular);
  });
  bench('multiple string + number', () => {
    loggers.dummyNodeJson.neodx.info(...exampleLogArgs.printfMixedSimple);
  });
  bench('complex', () => {
    loggers.dummyNodeJson.neodx.info(...exampleLogArgs.printfMixedComplex);
  });
});

describe('json target - multiple modes', () => {
  bench('string', () => {
    loggers.dummyNodeJson.neodx.info('hello');
  });
  bench('printf (simple)', () => {
    loggers.dummyNodeJson.neodx.info('hello %s', 'world');
  });
  bench('printf (medium)', () => {
    loggers.dummyNodeJson.neodx.info('hello %s %j %d', 'world', exampleObjects.simple, 123);
  });
  bench('printf (complex)', () => {
    loggers.dummyNodeJson.neodx.info('hello %s %j at %d', 'world', exampleObjects.circular, 123);
  });
  bench('object (simple)', () => {
    loggers.dummyNodeJson.neodx.info({ hello: 'world', a: 1, b: 2 });
  });
  bench('object (circular)', () => {
    loggers.dummyNodeJson.neodx.info(exampleObjects.circular);
  });
  bench('error (simple)', () => {
    loggers.dummyNodeJson.neodx.info(exampleObjects.simpleError);
  });
  bench('error with object (simple)', () => {
    loggers.dummyNodeJson.neodx.info(exampleObjects.simpleErrorWithMeta);
  });
});
