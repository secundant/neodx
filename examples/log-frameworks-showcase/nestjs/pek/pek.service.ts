import { InjectLogger } from '@neodx/log/nest';
import { Injectable } from '@nestjs/common';
import type { Logger } from '../logger';

@Injectable()
export class PekService {
  constructor(@InjectLogger(PekService.name) private readonly log: Logger) {}

  public sayHello(): string {
    this.log.info('This stuff will be logged in the PekService context');

    return 'pek';
  }
}
