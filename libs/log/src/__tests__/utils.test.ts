import { beforeEach, describe, expect, test, vitest } from 'vitest';
import { createLogger } from '../index.ts';
import { createLoggerAutoFactory } from '../utils/create-auto-logger-factory.ts';

describe('createLoggerAutoFactory', () => {
  const spy = vitest.fn(createLogger);
  const createAutoLogger = createLoggerAutoFactory(spy as typeof createLogger);

  beforeEach(() => spy.mockClear());

  test('should create logger based on string', () => {
    createAutoLogger('info');
    expect(spy).toHaveBeenLastCalledWith({ level: 'info' });
  });

  test('should create logger based on params', () => {
    createAutoLogger({ level: 'warn' });
    expect(spy).toHaveBeenLastCalledWith({ level: 'warn' });
  });

  test('should create logger based on user defined logger', () => {
    const userLogger = createLogger({ level: 'error' });
    const logger = createAutoLogger(userLogger);

    expect(logger).toBe(userLogger);
    expect(spy).not.toHaveBeenCalled();
  });

  test('should create silent logger', () => {
    createAutoLogger('silent');
    expect(spy).toHaveBeenLastCalledWith({ level: 'silent' });
  });

  test('should create logger with default params', () => {
    createAutoLogger('info', { name: 'test' });
    createAutoLogger({ level: 'warn' }, { name: 'test' });
    expect(spy).toHaveBeenNthCalledWith(1, { level: 'info', name: 'test' });
    expect(spy).toHaveBeenNthCalledWith(2, { level: 'warn', name: 'test' });
  });
});
