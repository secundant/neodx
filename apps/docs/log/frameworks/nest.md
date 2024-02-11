# Add `@neodx/log` to [Nest.js](https://nestjs.com) application

## Getting started

`@neodx/log/nest` is a module for nestjs integration.
Under the hood, it uses an express adapter and http module ( [`@neodx/log/express`](./express.md) and
[`@neodx/log/http`](./http.md) )

::: info
Checkout the [configuration example](https://github.com/secundant/neodx/tree/master/examples/log-frameworks-showcase/nestjs)
in the `log-frameworks-showcase` folder.
:::

## Example

Disable `bufferLogs` and setup provided logger:

```typescript
import { Logger } from '@neodx/log/nest';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  await app.listen(3000);
}

bootstrap();
```

Import the `NeodxModule` module in root module:

```typescript
import { NeodxModule } from '@neodx/log/nest';

@Module({
  imports: [NeodxModule.forRoot()]
})
class AppModule {}
```

Inject a logger using the `@InjectLogger` decorator.
Use its methods wherever you want

```typescript
import { InjectLogger } from '@neodx/log/nest';
import type { Logger, DefaultLoggerLevel } from '@neodx/log';

@Controller()
export class AppController {
  constructor(
    @InjectLogger(AppController.name)
    private readonly log: Logger<DefaultLoggerLevel>
  ) {}

  @Get()
  public getHello() {
    this.log.error(new Error('Something went wrong'));

    this.log.info('Hello, world!');
    this.log.info({ object: 'property' }, 'Template %s', 'string');
  }
}
```

It is important to note that the injection scope
`TRANSIENT` class is injected under the hood, and not the instance itself.
each provider will receive a new logger instance.

## Configuration

### Zero-config

Use `NeodxModule.forRoot` method without any parameters:

```typescript
@Module({
  imports: [NeodxModule.forRoot()]
})
class AppModule {}
```

::: info
If you don't pass parameters, then logger will be created under the hood.
:::

### With provided logger

```typescript
import { createLogger, DEFAULT_LOGGER_LEVELS } from '@neodx/log';
import { pretty } from '@neodx/log/node';
import { NeodxModule } from '@neodx/log/nest';
import { Module } from '@nestjs/common';

export const logger = createLogger({
  target: pretty(),
  levels: {
    ...DEFAULT_LOGGER_LEVELS,
    custom: 80
  }
});

@Module({
  imports: [
    NeodxModule.forRoot({
      logger,
      http: {
        simple: true,
        shouldLog: true
      },
      // exclude or include some routes
      exclude: [{ path: 'pek', method: RequestMethod.GET }],
      forRoutes: [PekController, AppController]
    })
  ]
})
export class AppModule {}
```

You can use these parameters in addition to the instance logger or its options:

```typescript
interface BaseLoggerParams {
  /**
   * Which routes will be ignored by logger middleware
   * @example [{ path: '*', method: RequestMethod.GET }]
   * @default []
   */
  exclude?: ExcludedRoutes;
  /**
   * Which routes will be included by logger middleware
   */
  forRoutes?: AppliedRoutes;
  /**
   * Which routes will be included by logger middleware
   * @example (logger) => createExpressLogger({ logger })
   */
  http?: ((logger: Logger<HttpLogLevels>) => ExpressMiddleware) | HttpLoggerParams;
  /**
   * Rename system logger names
   * @default internalLoggerNames
   * @internal
   */
  overrideNames?: InternalLogNames;
}
```

The `@neodx/log` instance is not a class and has dynamic methods,
so we cannot get the class directly from the library.
So just use `typeof` here

```typescript
export type Logger = typeof logger;

@Injectable()
export class AppService {
  constructor(
    @InjectLogger(AppService.name)
    private readonly log: Logger
  ) {}
}
```

### Without provided logger

In fact, you can customize the logger parameters directly in the module.

The module will create an instance logger under the hood.
To get the logger-instance type, use the `Logger`
type from `@neodx/log`

```typescript
@Module({
  imports: [
    NeodxModule.forRoot({
      // customize levels
      levels: {
        info: 10,
        debug: 20,
        warn: 30
      },
      level: 'info',

      target: [pretty(), file('./logs/writable.log')],
      http: {
        simple: true,
        shouldLog: true
      },
      overrideNames: {
        system: 'Application'
      },
      exclude: [{ path: 'pek', method: RequestMethod.GET }]
    })
  ]
})
class AppModule {}
```

### Asynchronous configuration

```typescript
import { NeodxModule } from '@neodx/log/nest';

@Module({
  imports: [
    NeodxModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: async () => {
        await asyncOperation();

        return {
          // { ... }
        };
      }
    })
  ]
})
export class AppModule {}
```

### Usage with `useClass` property

Create a configuration service
that implements from `NeodxModuleOptionsFactory`
and providers module options.

```typescript
import { NeodxModuleOptionsFactory, NeodxModule } from '@neodx/log/nest';

@Injectable()
export class NeodxOptionsService implements NeodxModuleOptionsFactory {
  public createNeodxOptions(): LoggerModuleParams | LoggerModuleAsyncParams {
    return {
      // { ... }
    };
  }
}

@Module({
  imports: [NeodxModule.forRootAsync({ useClass: NeodxOptionsService })]
})
export class AppModule {}
```

## Utilities

### See stack trace in `err` prop with `LoggerInterceptor`

To expose actual error details you need you to use
interceptor which captures exceptions and assigns them
to the response.

```typescript
import { LoggerInterceptor } from '@neodx/log/nest';

app.useGlobalInterceptors(new LoggerInterceptor());
```
