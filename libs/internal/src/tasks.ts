import { colors } from '@neodx/colors';
import { type Logger } from '@neodx/log';
import { type Falsy, invariant, isTypeOfFunction } from '@neodx/std';
import { redefineName } from '@neodx/std/shared';
import { linkError } from './errors.ts';
import { timeDisplay } from './log.ts';

type EnabledTaskInvariant<Args extends readonly unknown[], Result> =
  | string
  | ((result: Result, ...args: Args) => string);
type DisabledTaskInvariant = false | void;

export function createTaskRunner({ log }: { log?: Logger<'error' | 'debug'> } = {}) {
  return {
    task: <
      const Args extends readonly unknown[],
      Result,
      Invariant extends EnabledTaskInvariant<Args, Result> | DisabledTaskInvariant = false
    >(
      name: string,
      handler: (...args: Args) => Result | Promise<Result>,
      {
        mapError,
        invariant: invariantMessage,
        mapSuccessMessage
      }: {
        mapSuccessMessage?: NoInfer<(result: Result, ...args: Args) => string>;
        invariant?: Invariant;
        mapError?: NoInfer<(cause: unknown, ...args: Args) => string | Error>;
      } = {}
    ) => {
      async function task(
        ...args: Args
      ): Promise<Invariant extends DisabledTaskInvariant ? Result : Exclude<Result, Falsy>> {
        const printAllTime = timeDisplay();

        try {
          const result = await handler(...args);

          if (mapSuccessMessage) {
            log?.debug(
              `${colors.gray(`[${name}] ${printAllTime()}`)} ${mapSuccessMessage(result, ...args)}`
            );
          }
          if (invariantMessage) {
            invariant(
              result,
              isTypeOfFunction(invariantMessage)
                ? invariantMessage(result, ...args)
                : invariantMessage
            );
          }
          return result as any;
        } catch (error) {
          // eslint-disable-next-line no-ex-assign
          error = linkError(mapError?.(error, ...args), error);
          log?.error(error);
          throw error;
        }
      }

      redefineName(task, name);
      return Object.assign(task, createTaskRunner({ log }));
    }
  };
}
