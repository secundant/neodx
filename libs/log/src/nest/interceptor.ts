/* eslint-disable @typescript-eslint/no-explicit-any */
import { isNil } from '@neodx/std';
import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { catchError, Observable, throwError } from 'rxjs';
import type { MaybePromise } from './types';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): MaybePromise<Observable<any>> {
    return next.handle().pipe(
      catchError(error => {
        return throwError(() => {
          const response = context.switchToHttp().getResponse();

          if (isNil(response.raw)) {
            response.err = error;
          }
        });
      })
    );
  }
}
