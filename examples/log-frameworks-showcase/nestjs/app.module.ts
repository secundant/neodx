/* eslint-disable @typescript-eslint/ban-ts-comment */

import { NeodxModule } from '@neodx/log/nest';
import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { PekController } from './controllers/pek.controller';
import { PekService } from './services/pek.service';

@Module({
  imports: [
    NeodxModule.forRoot()

    /**
     * Complex configuration
     */
    // NeodxModule.forRootAsync({ useClass: NeodxOptionsService })
  ],
  controllers: [PekController, AppController],
  providers: [PekService]
})
export class AppModule {}
