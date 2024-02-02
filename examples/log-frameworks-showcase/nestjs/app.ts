import { Logger, LoggerInterceptor } from '@neodx/log/nest';
import { ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // bufferLogs is important here.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Replace the NestJS default logger
  app.useLogger(app.get(Logger));

  // (optional)
  // Use the `LoggerInterceptor` to handle some types
  // of exceptions after the response.
  app.useGlobalInterceptors(new LoggerInterceptor());

  app.enableShutdownHooks();

  await app.listen(3000);
}

void bootstrap();

process.once(ShutdownSignal.SIGUSR2, () => process.exit(0));
process.once(ShutdownSignal.SIGINT, () => process.exit(0));
