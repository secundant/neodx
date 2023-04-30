import { createColors } from '@neodx/colors';
import { describe, expect, test, vi } from 'vitest';
import { createLogger } from '../index';
import type { PrettyStreamOptions } from '../node';
import { createPrettyTarget } from '../node';
import type { DefaultLoggerLevel } from '../shared';
import type { LoggerParams } from '../types';

describe('node pretty stream', () => {
  const createTestLogger = (
    params?: Partial<LoggerParams<DefaultLoggerLevel>>,
    prettyParams?: Partial<PrettyStreamOptions>
  ) => {
    const log = vi.fn();
    const logError = vi.fn();
    const logger = createLogger({
      target: [
        {
          level: 'error',
          target: [
            createPrettyTarget({
              log,
              logError,
              colors: createColors(false, true),
              ...prettyParams
            })
          ]
        }
      ],
      ...params
    });

    return {
      log,
      logError,
      logger
    };
  };

  test('should log', async () => {
    const { log, logger } = createTestLogger();

    logger.info('foo');

    expect(log.mock.lastCall).toEqual([
      expect.stringMatching(/\d{2}:\d{2}:\d{2}.\d{3} ℹ info: foo/)
    ]);
  });

  test('should log with name', async () => {
    const { log, logger } = createTestLogger({
      name: 'test'
    });

    logger.info('foo');
    expect(log.mock.lastCall).toEqual([
      expect.stringMatching(/\d{2}:\d{2}:\d{2}.\d{3} ℹ info test: foo/)
    ]);
  });

  test('should print simple errors and literals', async () => {
    const { log, logError, logger } = createTestLogger();

    logger.error('foo');
    expect(log.mock.lastCall).toEqual([
      expect.stringMatching(/\d{2}:\d{2}:\d{2}.\d{3} error: foo/)
    ]);
    expect(logError).not.toBeCalled();

    logger.error(new Error('as error'));
    expect(logError.mock.lastCall).toEqual([
      expect.stringMatching(/\d{2}:\d{2}:\d{2}.\d{3} Error: as error/),
      expect.stringContaining('Error: as error')
    ]);
    expect(log).toBeCalledTimes(1);
  });

  test('should print complex error', () => {
    const { logError, logger } = createTestLogger();

    const getError = () => {
      try {
        try {
          throw new SyntaxError('smth wrong');
        } catch (error) {
          throw new Error('middle', { cause: error });
        }
      } catch (error) {
        return new TypeError('final', { cause: error });
      }
    };

    logger.error(getError());
    expect(logError.mock.lastCall).toEqual([
      expect.stringMatching(/\d{2}:\d{2}:\d{2}.\d{3} TypeError: final/),
      expect.stringContaining('TypeError: final')
    ]);
  });

  test('should print object', async () => {
    const { log, logger } = createTestLogger();

    logger.info({ foo: 'bar' });
    expect(log.mock.lastCall).toEqual([
      expect.stringMatching(/\d{2}:\d{2}:\d{2}.\d{3} ℹ info: \{\n {2}"foo": "bar"\n}/)
    ]);
  });

  test('should print object with err', () => {
    const { logError, logger } = createTestLogger();

    logger.error({ foo: 'bar', err: new Error('example'), bar: 'bar' }, 'additional message');
    expect(logError.mock.lastCall).toEqual([
      expect.stringMatching(
        /\d{2}:\d{2}:\d{2}.\d{3} Error: additional message \{\n {2}"foo": "bar",\n {2}"bar": "bar"\n}/
      ),
      expect.stringContaining('Error: example')
    ]);
  });

  test('should display log without time', () => {
    const { log, logger } = createTestLogger(
      {},
      {
        displayTime: false
      }
    );

    logger.info('foo');
    expect(log.mock.lastCall).toEqual([`ℹ info: foo`]);
  });

  test('should display log without level', () => {
    const { log, logger } = createTestLogger(
      {},
      {
        displayLevel: false
      }
    );

    logger.info({ a: 1 }, 'foo');
    expect(log.mock.lastCall).toEqual([
      expect.stringMatching(/\d{2}:\d{2}:\d{2}.\d{3} foo \{\n {2}"a": 1\n}/)
    ]);
  });

  test('should display log without time and level', () => {
    const { log, logError, logger } = createTestLogger(
      {},
      {
        displayTime: false,
        displayLevel: false
      }
    );

    logger.info('foo');
    expect(log.mock.lastCall).toEqual([`foo`]);
    logger.error(new Error('abc'));
    expect(logError.mock.lastCall).toEqual(['abc', expect.stringContaining('Error: abc')]);
  });
});
