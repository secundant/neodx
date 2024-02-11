import { hasOwn, isObject, toCase } from '@neodx/std';
import type { ModuleMetadata, Type } from '@nestjs/common';
import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { createServer } from 'node:net';
import request from 'supertest';
import { expect, vi } from 'vitest';
import type { DefaultLoggerLevel, LogChunk, Logger, LoggerParamsWithLevels } from '../..';
import { createLogger } from '../..';
import type { DefaultLoggerLevelsConfig } from '../../core/shared';
import { InjectLogger } from '../../nest/inject';
import { SystemLogger } from '../../nest/loggers/system-logger';
import { LoggerModule } from '../../nest/module';
import type { LoggerModuleAsyncParams, LoggerModuleParams } from '../../nest/types';
import { file } from '../../node/json';

export async function getFreePort() {
  const isValidAddress = (address: unknown): address is { port: number } =>
    isObject(address) && hasOwn(address, 'port');

  return new Promise<number>(res => {
    const srv = createServer();

    srv.listen(0, () => {
      const address = srv.address();

      if (isValidAddress(address)) {
        srv.close(() => res(address.port));
      }
    });
  });
}

export class NestLoggerTest {
  private module?: Type<unknown>;
  private expectedCode = 200;

  constructor(private readonly metadata: ModuleMetadata) {}

  public forRoot(params?: LoggerModuleParams) {
    @Module({
      ...this.metadata,
      imports: [LoggerModule.forRoot(params)],
      ...(this.metadata.imports || [])
    })
    class TestingModule {}

    this.module = TestingModule;

    return this;
  }

  public forRootAsync(params: LoggerModuleAsyncParams) {
    @Module({
      ...this.metadata,
      imports: [LoggerModule.forRootAsync(params)],
      ...(this.metadata.imports || [])
    })
    class TestingModule {}

    this.module = TestingModule;

    return this;
  }

  public expectError(errorCode: number) {
    this.expectedCode = errorCode;

    return this;
  }

  public async run(...paths: string[]): Promise<any> {
    paths = paths.length > 0 ? paths : ['/'];

    expect(this.module).toBeTruthy();

    const app = await NestFactory.create(this.module, {
      bufferLogs: true
    });

    app.useLogger(app.get(SystemLogger));
    app.enableShutdownHooks();

    const server = await app.listen(await getFreePort(), '0.0.0.0');

    for (const path of paths) {
      await request(server).get(path).expect(this.expectedCode);
    }

    await app.close();
  }
}

export const getRandomValue = () => Math.random().toString();

interface CreateControllerParams {
  name?: string;
  message?: string;
  route?: string;
}

const normalizeControllerName = (name: string) => `${toCase(name, 'Case')}Controller`;

export function createEmptyController({
  name = 'default',
  message,
  route = '/'
}: CreateControllerParams): Type<unknown> {
  const normalized = normalizeControllerName(name);

  @Controller(route)
  class CreatedController {
    constructor(
      @InjectLogger(normalized)
      private readonly logger: Logger<DefaultLoggerLevel>
    ) {}

    @Get()
    public get() {
      this.logger.info(message ?? normalized);

      return {};
    }
  }

  return CreatedController;
}

export function createLoggerWithChunks(
  opts?: Partial<LoggerParamsWithLevels<DefaultLoggerLevelsConfig>>
) {
  const chunks: LogChunk<DefaultLoggerLevel>[] = [];

  const handler = vi.fn((chunk: LogChunk<DefaultLoggerLevel>) => {
    chunks.push(chunk);
  });

  const logger = createLogger({
    ...opts,
    // disable terminal logs
    target: [handler, file('/dev/null')]
  });

  const hasProvider = (providerName: string) => chunks.some(chk => chk.name === providerName);
  const hasMessage = (message: string) => chunks.some(chk => chk.msg === message);

  return { logger, chunks, handler, hasProvider, hasMessage };
}
