import { RequestMethod } from '@nestjs/common';
import { beforeEach, describe, expect, test } from 'vitest';
import {
  createEmptyController,
  createLoggerWithChunks,
  getRandomValue,
  NestLoggerTest
} from './testing-utils';

describe('routing', () => {
  let defaultMsg: string;
  let excludedMsg: string;

  beforeEach(() => {
    defaultMsg = getRandomValue();
    excludedMsg = getRandomValue();
  });

  test('should disable logger middleware when routes are not provided', async () => {
    const { logger, hasProvider } = createLoggerWithChunks();

    const DefaultController = createEmptyController({
      message: defaultMsg
    });

    const ExcludedController = createEmptyController({
      name: 'excluded',
      route: 'excluded',
      message: excludedMsg
    });

    const runner = new NestLoggerTest({
      controllers: [DefaultController, ExcludedController]
    });

    await runner.forRoot({ logger, forRoutes: [] }).run('/', '/excluded');

    expect(hasProvider('LoggerMiddleware')).toBeFalsy();

    // programmatic logs still exist
    expect(hasProvider('DefaultController')).toBeTruthy();
    expect(hasProvider('ExcludedController')).toBeTruthy();
  });

  test('should exclude from middleware', async () => {
    const { chunks, logger } = createLoggerWithChunks();

    const DefaultController = createEmptyController({
      message: defaultMsg
    });

    const ExcludedController = createEmptyController({
      name: 'excluded',
      route: 'excluded',
      message: excludedMsg
    });

    const runner = new NestLoggerTest({
      controllers: [DefaultController, ExcludedController]
    });

    await runner
      .forRoot({ logger, exclude: [{ path: '/excluded', method: RequestMethod.ALL }] })
      .run('/', '/excluded');

    expect(chunks.filter(chk => chk.name === 'LoggerMiddleware')).toHaveLength(1);
  });

  test('should exclude from middleware', async () => {
    const { logger, chunks } = createLoggerWithChunks();

    const DefaultController = createEmptyController({
      message: defaultMsg
    });

    const ExcludedController = createEmptyController({
      name: 'excluded',
      route: 'excluded',
      message: excludedMsg
    });

    const runner = new NestLoggerTest({
      controllers: [DefaultController, ExcludedController]
    });

    await runner.forRoot({ logger, forRoutes: [ExcludedController] }).run('/', '/excluded');

    expect(
      chunks.filter(chk => chk.name === 'LoggerMiddleware' && chk.msg.includes('/excluded'))
    ).toHaveLength(1);
  });

  test('should log everyone by default', async () => {
    const { logger, chunks } = createLoggerWithChunks();

    const DefaultController = createEmptyController({
      message: defaultMsg
    });

    const ExcludedController = createEmptyController({
      name: 'excluded',
      route: 'excluded',
      message: excludedMsg
    });

    const runner = new NestLoggerTest({
      controllers: [DefaultController, ExcludedController]
    });

    await runner.forRoot({ logger }).run('/', '/excluded');

    expect(chunks.filter(chk => chk.name === 'LoggerMiddleware')).toHaveLength(2);
  });
});
