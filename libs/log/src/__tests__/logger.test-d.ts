import { assertType, describe, expectTypeOf, test } from 'vitest';
import {
  type CreateLogger,
  createLogger,
  createLoggerFactory,
  type DefaultLoggerLevel,
  type Logger
} from '../index';
import { printf, readArguments } from '../utils';

describe('logger types', () => {
  test('should support createLoggerFactory', () => {
    const baseParams = {
      readArguments,
      formatMessage: printf
    };

    expectTypeOf(
      createLoggerFactory({
        ...baseParams,
        defaultParams: {
          levels: {
            error: 10,
            warn: 20,
            kek: 200,
            pek: 'kek'
          }
        }
      })
    ).toEqualTypeOf<CreateLogger<'error' | 'warn' | 'kek' | 'pek'>>();
  });

  test('should override levels', () => {
    expectTypeOf(createLogger({ level: 'debug' })).toEqualTypeOf<Logger<DefaultLoggerLevel>>();
    expectTypeOf(createLogger({ levels: { a: 1 } })).toEqualTypeOf<Logger<'a'>>();
    expectTypeOf(createLogger({ levels: { a: 1, b: 2 }, level: 'a' })).toEqualTypeOf<
      Logger<'a' | 'b'>
    >();
    // @ts-expect-error "c" level does not exist in custom levels
    assertType(createLogger({ levels: { a: 1, b: 2 }, level: 'c' }));
    // @ts-expect-error "c" level does not exist in built-in levels
    assertType(createLogger({ level: 'c' }));
  });

  test('should override levels in fork', () => {
    const base = createLogger();
    const customBase = createLogger({ levels: { a: 1 } });

    expectTypeOf(base.fork()).toEqualTypeOf<Logger<DefaultLoggerLevel>>();
    expectTypeOf(base.fork({ level: 'debug' })).toEqualTypeOf<Logger<DefaultLoggerLevel>>();
    expectTypeOf(base.fork({ levels: { a: 1 } })).toEqualTypeOf<Logger<'a'>>();
    expectTypeOf(customBase.fork()).toEqualTypeOf<Logger<'a'>>();
    expectTypeOf(customBase.fork({ levels: { b: 2 } })).toEqualTypeOf<Logger<'b'>>();
    expectTypeOf(customBase.fork({ levels: { b: 2 } }).fork()).toEqualTypeOf<Logger<'b'>>();
    expectTypeOf(
      customBase
        .fork({ levels: { b: 2 } })
        .fork()
        .fork({ levels: { c: 3 } })
    ).toEqualTypeOf<Logger<'c'>>();
  });

  test('should override levels in child', () => {
    const base = createLogger();
    const customBase = createLogger({ levels: { a: 1 } });

    expectTypeOf(base.child('child')).toEqualTypeOf<Logger<DefaultLoggerLevel>>();
    expectTypeOf(base.child('child', { level: 'debug' })).toEqualTypeOf<
      Logger<DefaultLoggerLevel>
    >();
    expectTypeOf(base.child('child', { levels: { a: 1 } })).toEqualTypeOf<Logger<'a'>>();
    expectTypeOf(customBase.child('child')).toEqualTypeOf<Logger<'a'>>();
    expectTypeOf(customBase.child('child', { levels: { b: 2 } })).toEqualTypeOf<Logger<'b'>>();
    expectTypeOf(customBase.child('child', { levels: { b: 2 } }).child('child')).toEqualTypeOf<
      Logger<'b'>
    >();
    expectTypeOf(
      customBase
        .child('child', { levels: { b: 2 } })
        .child('child')
        .child('child', { levels: { c: 3 } })
    ).toEqualTypeOf<Logger<'c'>>();
  });

  test('should support widest level', () => {
    function wrapper(_: Logger<'a' | 'b'>) {}

    // @ts-expect-error default levels are different
    wrapper(createLogger());
    wrapper(createLogger({ levels: { a: 1, b: 2 } }));
    wrapper(createLogger({ levels: { a: 1, b: 2, c: 3 } }));
  });
});
