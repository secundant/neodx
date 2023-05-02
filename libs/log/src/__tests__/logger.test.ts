import { difference, keys, mapObject } from '@neodx/std';
import { describe, expect, test, vi } from 'vitest';
import { type DefaultLoggerLevel, createLogger, DEFAULT_LOGGER_LEVELS } from '../node';
import type { LogChunk, LoggerParams } from '../types';

describe('logger', () => {
  const createTestLogger = () => {
    const messagesFn = vi.fn();
    const handler = vi.fn(chunk => messagesFn(chunk.msg));
    const logger = createLogger({
      level: 'info',
      target: handler,
      meta: {}
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
        msg: ''
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
    expect(messagesFn).toHaveBeenLastCalledWith('circular {"foo":"bar","circular":"[Circular]"}');

    const circular2 = { a: [{ b: [null, { c: [] }] }], d: [{ e: [] }] } as const;

    (circular2 as any).a[0].b[1].c.push(circular2);
    (circular2 as any).d[0].e.push(circular2.a[0].b[1].c);

    logger.info('circular %j', circular2);
    expect(messagesFn).toHaveBeenLastCalledWith(
      'circular {"a":[{"b":[null,{"c":["[Circular]"]}]}],"d":[{"e":[["[Circular]"]]}]}'
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
          target: [info]
        },
        {
          level: 'error',
          target: [error]
        },
        {
          level: 'verbose',
          target: [verbose]
        }
      ]
    });

    logger.info('foo');
    expect(info).toHaveBeenLastCalledWith(expect.objectContaining({ msg: 'foo' }));
    expect(error).toHaveBeenLastCalledWith(expect.objectContaining({ msg: 'foo' }));
    expect(verbose).not.toHaveBeenCalled();

    logger.error('bar');
    expect(info).toBeCalledTimes(1);
    expect(error).toHaveBeenLastCalledWith(expect.objectContaining({ msg: 'bar' }));
    expect(verbose).not.toHaveBeenCalled();

    logger.verbose('baz');
    expect(info).toHaveBeenLastCalledWith(expect.objectContaining({ msg: 'baz' }));
    expect(error).toHaveBeenLastCalledWith(expect.objectContaining({ msg: 'baz' }));
    expect(verbose).toHaveBeenLastCalledWith(expect.objectContaining({ msg: 'baz' }));

    expect(info).toBeCalledTimes(2);
    expect(error).toBeCalledTimes(3);
    expect(verbose).toBeCalledTimes(1);
  });

  describe('should support different levels combination', async () => {
    const init = (params?: Partial<LoggerParams<DefaultLoggerLevel>>) => {
      const levels = { ...DEFAULT_LOGGER_LEVELS };
      const spies = mapObject(levels, () => vi.fn());
      const target = keys(levels).map(level => ({
        level,
        target: [spies[level]]
      }));
      const logger = createLogger({
        level: 'verbose',
        levels,
        target,
        meta: {},
        ...params
      });
      const check = (
        expectedTriggeredLevels: DefaultLoggerLevel[],
        expectedChunkPartials: Partial<LogChunk<DefaultLoggerLevel>>
      ) => {
        for (const level of expectedTriggeredLevels) {
          expect(spies[level], `${level} should be called`).toHaveBeenLastCalledWith(
            expect.objectContaining(expectedChunkPartials)
          );
        }
        for (const level of difference(keys(spies), expectedTriggeredLevels)) {
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
        msg: ''
      });
    });

    test('should call only lower level', () => {
      const { logger, check } = init();

      logger.error({ foo: 'bar' });
      check(['error'], {
        level: 'error',
        meta: { foo: 'bar' },
        msg: ''
      });
    });

    test('should ignore higher levels', () => {
      const { logger, check } = init();

      logger.debug({ foo: 'bar' });
      check([], {
        level: 'debug',
        meta: { foo: 'bar' },
        msg: ''
      });
    });

    test('should support silent level', () => {
      const { logger, spies } = init({
        level: 'silent'
      });

      logger.info('foo');
      logger.error(new Error('...'));
      logger.warn({ foo: 'bar' });
      logger.debug({ foo: 'bar' });
      logger.verbose({ foo: 'bar' });

      // check([], {});
      expect(spies.error).not.toHaveBeenCalled();
      expect(spies.info).not.toHaveBeenCalled();
      expect(spies.warn).not.toHaveBeenCalled();
      expect(spies.verbose).not.toHaveBeenCalled();
      expect(spies.debug).not.toHaveBeenCalled();
      expect(spies.silent).not.toHaveBeenCalled();
    });
  });
});
