import { assertType, describe, expectTypeOf, test } from 'vitest';
import { type DefaultLoggerLevel, type Logger, createLogger } from '../index';

describe('logger types', () => {
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
});
