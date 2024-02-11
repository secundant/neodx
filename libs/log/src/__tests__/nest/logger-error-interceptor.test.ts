import { createLoggerWithChunks, NestLoggerTest } from './testing-utils';
import { LoggerInterceptor } from '../../nest';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { describe, expect, test } from 'vitest';

describe('error interceptor', () => {
  test('should properly collect logs', async () => {
    class CustomError extends Error {
      constructor() {
        super('custom error');
      }
    }

    const { chunks, logger } = createLoggerWithChunks();

    @Controller('/')
    class TestController {
      @Get('/')
      get() {
        throw new CustomError();
      }
    }

    const runner = new NestLoggerTest({
      controllers: [TestController],
      providers: [{ provide: APP_INTERCEPTOR, useClass: LoggerInterceptor }]
    });

    await runner.forRoot({ logger }).expectError(HttpStatus.INTERNAL_SERVER_ERROR).run();

    expect(chunks.some(chunk => chunk.error?.message === 'custom error')).toBeTruthy();
  });
});
