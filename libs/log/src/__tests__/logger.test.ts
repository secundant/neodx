import { difference, keys, mapObject } from '@neodx/std';
import { describe, expect, test, vi } from 'vitest';
import { createLogger, defaultLevels, type StandardLogLevel } from '../create-logger';
import type { LogChunk } from '../types';

describe('logger', () => {
  const createTestLogger = () => {
    const messagesFn = vi.fn();
    const handler = vi.fn(chunk => messagesFn(chunk.message));
    const logger = createLogger({
      target: [
        {
          level: 'info',
          targets: [handler]
        }
      ]
    });

    return {
      logger,
      handler,
      messagesFn
    };
  };

  test('should print object', async () => {
    const { handler, logger } = createTestLogger();

    logger.info({ foo: 'bar' });
    expect(handler).toHaveBeenLastCalledWith(
      expect.objectContaining({
        meta: { foo: 'bar' },
        message: ''
      })
    );
  });

  test('should print message', async () => {
    const { messagesFn, logger } = createTestLogger();

    logger.info('foo');
    expect(messagesFn).toHaveBeenLastCalledWith('foo');
    logger.info('bar %s', 'foo');
    expect(messagesFn).toHaveBeenLastCalledWith('bar foo');
    logger.info('bar %d', 'foo');
    expect(messagesFn).toHaveBeenLastCalledWith('bar NaN');
    logger.info('bar %j', { foo: 'bar' });
    expect(messagesFn).toHaveBeenLastCalledWith('bar {"foo":"bar"}');
    logger.info('bar %o', { foo: 'bar' });
    expect(messagesFn).toHaveBeenLastCalledWith('bar {"foo":"bar"}');
    logger.info('bar %O', { foo: 'bar' });
    expect(messagesFn).toHaveBeenLastCalledWith('bar {"foo":"bar"}');
    logger.info('user %s %s, %d age, %j meta', 'John', 'Doe', 25, { foo: 'bar' });
    expect(messagesFn).toHaveBeenLastCalledWith('user John Doe, 25 age, {"foo":"bar"} meta');
  });

  test('should print complex objects', async () => {
    const { messagesFn, logger } = createTestLogger();

    logger.info('objects %j and %j', { a: { b: { c: 'd' } } }, { e: 'f' });
    expect(messagesFn).toHaveBeenLastCalledWith('objects {"a":{"b":{"c":"d"}}} and {"e":"f"}');
    logger.info('structs %j', {
      map: new Map([
        ['a', 'b'],
        ['c', 'd']
      ])
    });
    expect(messagesFn).toHaveBeenLastCalledWith('structs {"map":{}}');
    logger.info('structs %j', {
      set: new Set(['a', 'b', 'c'])
    });
    expect(messagesFn).toHaveBeenLastCalledWith('structs {"set":{}}');
    logger.info('structs %j', {
      date: new Date('2020-01-01')
    });
    expect(messagesFn).toHaveBeenLastCalledWith('structs {"date":"2020-01-01T00:00:00.000Z"}');
    logger.info('structs %j', {
      regexp: /foo/,
      function: () => {},
      undefined,
      null: null,
      symbol: Symbol('foo'),
      error: new Error('foo'),
      promise: Promise.resolve('foo'),
      array: [1, 2, 3],
      object: { foo: 'bar' },
      map: new Map([['a', 'b']]),
      set: new Set(['a', 'b']),
      date: new Date('2020-01-01')
    });
    expect(messagesFn).toHaveBeenLastCalledWith(
      'structs {"regexp":{},"null":null,"error":{},"promise":{},"array":[1,2,3],"object":{"foo":"bar"},"map":{},"set":{},"date":"2020-01-01T00:00:00.000Z"}'
    );
  });

  test('should print circular objects', async () => {
    const { messagesFn, logger } = createTestLogger();

    const circular = { foo: 'bar' };

    (circular as any).circular = circular;

    logger.info('circular %j', circular);
    expect(messagesFn).toHaveBeenLastCalledWith('circular {"foo":"bar","circular":"<ref ~>"}');

    const circular2 = { a: [{ b: [null, { c: [] }] }], d: [{ e: [] }] } as const;

    (circular2 as any).a[0].b[1].c.push(circular2);
    (circular2 as any).d[0].e.push(circular2.a[0].b[1].c);

    logger.info('circular %j', circular2);
    expect(messagesFn).toHaveBeenLastCalledWith(
      'circular {"a":[{"b":[null,{"c":["<ref ~>"]}]}],"d":[{"e":[["<ref ~>"]]}]}'
    );
  });

  test('should support different streams levels', async () => {
    const info = vi.fn();
    const error = vi.fn();
    const verbose = vi.fn();
    const logger = createLogger({
      level: 'verbose', // default
      target: [
        {
          level: 'info',
          targets: [info]
        },
        {
          level: 'error',
          targets: [error]
        },
        {
          level: 'verbose',
          targets: [verbose]
        }
      ]
    });

    logger.info('foo');
    expect(info).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'foo' }));
    expect(error).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'foo' }));
    expect(verbose).not.toHaveBeenCalled();

    logger.error('bar');
    expect(info).toBeCalledTimes(1);
    expect(error).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'bar' }));
    expect(verbose).not.toHaveBeenCalled();

    logger.verbose('baz');
    expect(info).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'baz' }));
    expect(error).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'baz' }));
    expect(verbose).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'baz' }));

    expect(info).toBeCalledTimes(2);
    expect(error).toBeCalledTimes(3);
    expect(verbose).toBeCalledTimes(1);
  });

  describe('should support different levels combination', async () => {
    const init = () => {
      const levels = { ...defaultLevels };
      const spies = mapObject(levels, (_, level) => vi.fn());
      const target = keys(levels).map(level => ({
        level,
        targets: [spies[level]]
      }));
      const logger = createLogger({
        level: 'verbose',
        levels,
        target
      });
      const check = (levels: StandardLogLevel[], expected: Partial<LogChunk<StandardLogLevel>>) => {
        for (const level of levels) {
          expect(spies[level], `${level} should be called`).toHaveBeenLastCalledWith(
            expect.objectContaining(expected)
          );
        }
        for (const level of difference(keys(spies), levels)) {
          expect(spies[level], `${level} shouldn't be called`).not.toHaveBeenCalled();
        }
      };

      return {
        levels,
        spies,
        logger,
        check
      };
    };

    test('should call multiple levels', () => {
      const { logger, check } = init();

      logger.info({ foo: 'bar' });
      check(['error', 'warn', 'info'], {
        level: 'info',
        meta: { foo: 'bar' },
        message: ''
      });
    });

    test('should call only lower level', () => {
      const { logger, check } = init();

      logger.error({ foo: 'bar' });
      check(['error'], {
        level: 'error',
        meta: { foo: 'bar' },
        message: ''
      });
    });

    test('should ignore higher levels', () => {
      const { logger, check } = init();

      logger.debug({ foo: 'bar' });
      check([], {
        level: 'debug',
        meta: { foo: 'bar' },
        message: ''
      });
    });
  });
});
