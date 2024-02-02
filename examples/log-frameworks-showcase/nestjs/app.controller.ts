import { InjectLogger } from '@neodx/log/nest';
import { Controller, Get } from '@nestjs/common';
import type { Logger } from './logger';

/**
 * This controller will be ignored by logger
 * middleware due to `NeodxModule` configuration.
 * This controller is not included in `forRoutes` prop.
 */

@Controller()
export class AppController {
  constructor(@InjectLogger(AppController.name) private readonly log: Logger) {}

  @Get()
  public getHello() {
    /**
     * All request logs will be ignored in this controller.
     * In order to silence programmatic logs in this controller,
     * you just need to fork it with the 'silence' level.
     */

    this.log.info('it works');

    const child = this.log.child('pek');

    child.warn('child and fork methods are also included');

    return null;
  }
}
