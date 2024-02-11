import { keys } from '@neodx/std';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { describe, expect, test } from 'vitest';
import type { Logger } from '../../index';
import { createLogger, DEFAULT_LOGGER_LEVELS } from '../../index';
import { InjectLogger } from '../../nest/inject';
import { internalLogNames } from '../../nest/shared';
import type { DefaultLoggerLevel } from '../../node';
import { file } from '../../node';
import {
  createEmptyController,
  createLoggerWithChunks,
  getRandomValue,
  NestLoggerTest
} from './testing-utils';

describe('levels', () => {
  test('should not log at all then level is silent', async () => {
    const { chunks, logger } = createLoggerWithChunks({ level: 'silent' });

    const DefaultController = createEmptyController({});

    const runner = new NestLoggerTest({
      controllers: [DefaultController]
    });

    await runner.forRoot({ logger }).run();

    expect(chunks).toHaveLength(0);
  });

  test('should all levels by default', async () => {
    const { chunks, logger } = createLoggerWithChunks();

    const DefaultController = createEmptyController({});

    const runner = new NestLoggerTest({
      controllers: [DefaultController]
    });

    await runner.forRoot({ logger }).run();

    const includedContexts = [
      'DefaultController',
      internalLogNames.system,
      internalLogNames.middleware
    ];

    expect(chunks.every(chk => includedContexts.includes(chk.name))).toBeTruthy();
  });

  test('should not log levels higher than info', async () => {
    const { chunks, logger } = createLoggerWithChunks({ level: 'info' });

    const TestController = createEmptyController({
      name: 'test'
    });

    const runner = new NestLoggerTest({
      controllers: [TestController]
    });

    await runner.forRoot({ logger }).run();

    const excludedLevels = ['done', 'debug', 'success'];

    expect(chunks.some(chk => excludedLevels.includes(chk.level))).toBeFalsy();
    expect(chunks.some(chk => keys(DEFAULT_LOGGER_LEVELS).includes(chk.level))).toBeTruthy();
  });

  test('should throw with mismatched levels', async () => {
    const msg = getRandomValue();

    const logger = createLogger({
      levels: {
        info: 10
      },
      target: [file('/dev/null')]
    });

    @Controller('/')
    class TestController {
      constructor(
        @InjectLogger(TestController.name)
        private readonly logger: Logger<any>
      ) {}

      @Get('/')
      get() {
        this.logger.warn(msg);
        this.logger.debug(msg);
        this.logger.info(msg);

        return {};
      }
    }

    const runner = new NestLoggerTest({
      controllers: [TestController]
    });

    await runner
      .forRoot({ logger: logger as Logger<DefaultLoggerLevel> })
      .expectError(HttpStatus.INTERNAL_SERVER_ERROR)
      .run();
  });
});
