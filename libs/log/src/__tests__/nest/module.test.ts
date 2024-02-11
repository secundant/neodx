import { Injectable, Module } from '@nestjs/common';
import { describe, test } from 'vitest';
import { createLogger } from '../../index';
import { file } from '../../node/json';
import { createEmptyController, NestLoggerTest } from './testing-utils';

describe('module initialization', () => {
  const logger = createLogger({
    target: [file('/dev/null')]
  });

  test('should work properly without params', async () => {
    const TestController = createEmptyController({ name: 'test' });

    const runner = new NestLoggerTest({
      controllers: [TestController]
    });

    await runner.forRoot({ logger }).run();
  });

  test('should work with useFactory', async () => {
    const TestController = createEmptyController({ name: 'test' });

    const runner = new NestLoggerTest({
      controllers: [TestController]
    });

    await runner.forRootAsync({ useFactory: async () => ({ logger }) }).run();
  });

  test('should work with asynchronous configuration', async () => {
    @Injectable()
    class Config {
      readonly level = 'info';
    }

    @Module({
      providers: [Config],
      exports: [Config]
    })
    class ConfigModule {}

    const TestController = createEmptyController({ name: 'test' });

    const runner = new NestLoggerTest({
      controllers: [TestController]
    });

    await runner
      .forRootAsync({
        imports: [ConfigModule],
        inject: [Config],
        useFactory: async cfg => ({ level: cfg.level, target: [file('/dev/null')] })
      })
      .run();
  });
});
