/* eslint-disable @typescript-eslint/ban-ts-comment */

import { NeodxModule } from '@neodx/log/nest';
import { Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { log as logger } from './logger';
import { PekController } from './pek/pek.controller';
import { PekService } from './pek/pek.service';

// @ts-expect-error
const usageExamples = [
  /**
   * If you don't  pass parameters,
   * then  logger will be created under the hood
   */
  NeodxModule.forRoot(),
  NeodxModule.forRoot({
    levels: {
      hello: 'world'
    },
    meta: {
      pid: process.pid
    }
  }),
  NeodxModule.forRoot({
    // case with provided instance
    logger,
    // `createExpressLogger`
    // middleware configuration
    http: {
      simple: true,
      shouldLog: true
      // { ... }
    }, // also can be (logger) => {...}
    exclude: [{ path: 'pek', method: RequestMethod.GET }],
    forRoutes: [PekController, AppController],
    overrideNames: {
      system: 'MyApp',
      middleware: 'MyMiddleware'
    }
  }),
  NeodxModule.forRoot({
    /**
     * won't work, you need to pass
     * either the instance,
     * or the logger options.
     */
    // @ts-expect-error
    logger,
    levels: {
      hello: 'world'
    },
    // @ts-expect-error
    level: 'silent'
  })
];

@Module({
  imports: [
    NeodxModule.forRoot({
      forRoutes: [PekController],
      logger
    })
  ],
  controllers: [PekController, AppController],
  providers: [PekService]
})
export class AppModule {}
