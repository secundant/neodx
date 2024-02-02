import { InjectLogger } from '@neodx/log/nest';
import { Controller, Get, Inject } from '@nestjs/common';
import type { Logger } from '../logger';
import { PekService } from './pek.service';

/**
 * The logger injection is performed
 * using the `InjectLogger` decorator.
 */

@Controller('pek')
export class PekController {
  constructor(
    /**
     * It is important to note that the Injection Scope
     * `TRANSIENT` class is injected under the hood, and not the instance itself.
     * each provider will receive a new logger instance
     * @see https://docs.nestjs.com/fundamentals/injection-scopes
     */
    @InjectLogger(PekController.name) private readonly log: Logger,
    @Inject(PekService) private readonly pekService: PekService
  ) {}

  @Get()
  public getHello(): string {
    this.log.error(new Error('Something went wrong'));
    this.log.warn('Be careful!');

    this.log.info('Hello, world!');
    this.log.info({ object: 'property' }, 'Template %s', 'string');

    /**
     * with a complicated example,
     * done, success etc. will return an error,
     * since these overwritten log levels do not exist
     */

    this.log.done('Task completed');
    this.log.success('Alias for done');

    this.log.debug('Some additional information...');
    this.log.verbose('Alias for debug');

    return this.pekService.sayHello();
  }
}
