import { LoggerModule } from '../../nest/module';
import { assertType, describe, expectTypeOf, test } from 'vitest';
import { createLogger } from '../../index';
import type { LoggerModuleParams } from '../../nest/types';

describe('logger types', () => {
  const defaultLogger = createLogger();

  test('should support zero-config cases', () => {
    expectTypeOf({}).toMatchTypeOf<LoggerModuleParams>();
    expectTypeOf({ logger: defaultLogger }).toMatchTypeOf<LoggerModuleParams>();
  });

  test('should match levels', () => {
    // @ts-expect-error default levels do not match with custom
    assertType<LoggerModuleParams<{ custom: 'level' }>>({ logger: defaultLogger });

    expectTypeOf({
      logger: createLogger({
        levels: {
          custom: 'level'
        }
      })
    }).toMatchTypeOf<LoggerModuleParams<{ custom: 'level' }>>();

    expectTypeOf({
      levels: {
        info: 10,
        warn: 20
      }
    }).toMatchTypeOf<LoggerModuleParams<{ info: number; warn: number }>>();
  });

  test('should accept either instance or params', () => {
    assertType(
      LoggerModule.forRoot({
        logger: createLogger({
          levels: {
            custom: 'level'
          }
        })
      })
    );

    assertType(
      LoggerModule.forRoot({
        levels: {
          custom: 'level'
        }
      })
    );

    assertType(
      LoggerModule.forRoot({
        // @ts-expect-error both instance and levels are not allowed
        logger: defaultLogger,
        levels: {
          custom: 'level'
        }
      })
    );
  });
});
