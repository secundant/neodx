import { createLogger, type Logger } from '@neodx/log';
import { type Awaitable } from '@neodx/std';

export interface TaskParams {
  log?: Logger<'error'>;
}

export async function runTask<Result>(
  task: () => Awaitable<Result>,
  { log = createLogger() }: TaskParams = {}
): Promise<Result> {
  try {
    return await task();
  } catch (error) {
    log.error(error);
    throw error;
  }
}

export function createTaskRunner<Args extends any[], Result>(
  task: (...args: Args) => Awaitable<Result>,
  params?: TaskParams
) {
  return async function runner(...args: Args): Promise<Result> {
    return await runTask(() => task(...args), params);
  };
}
