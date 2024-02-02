/* eslint-disable @typescript-eslint/ban-ts-comment */

import { NeodxModule } from '@neodx/log/nest';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PekController } from './pek/pek.controller';
import { PekService } from './pek/pek.service';

@Module({
  imports: [
    NeodxModule.forRoot()

    // Complex configuration.
    // NeodxModule.forRootAsync({ useClass: NeodxOptionsService })
  ],
  controllers: [PekController, AppController],
  providers: [PekService]
})
export class AppModule {}
