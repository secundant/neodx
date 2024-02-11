import type { OnModuleInit } from '@nestjs/common';
import { Controller, Get, Inject, Injectable } from '@nestjs/common';
import { describe, expect, test } from 'vitest';
import type { DefaultLoggerLevel, Logger } from '../..';
import { InjectLogger } from '../../nest/inject';
import { createLoggerWithChunks, getRandomValue, NestLoggerTest } from './testing-utils';

describe('default case', () => {
  test('should collect logs with onModuleInit', async () => {
    const inReqMessage = getRandomValue();
    const outReqMessage = getRandomValue();

    const { logger, hasMessage } = createLoggerWithChunks();

    @Injectable()
    class TestService implements OnModuleInit {
      constructor(
        @InjectLogger(TestService.name) private readonly logger: Logger<DefaultLoggerLevel>
      ) {}

      someMethod() {
        this.logger.info(inReqMessage);
      }

      onModuleInit() {
        this.logger.info(outReqMessage);
      }
    }

    @Controller()
    class TestController {
      constructor(@Inject(TestService) private readonly service: TestService) {}
      @Get()
      get() {
        this.service.someMethod();
        return {};
      }
    }

    const runner = new NestLoggerTest({
      controllers: [TestController],
      providers: [TestService]
    });

    await runner.forRoot({ logger }).run();

    expect(hasMessage(inReqMessage)).toBeTruthy();
    expect(hasMessage(outReqMessage)).toBeTruthy();
  });
});
