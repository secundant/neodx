import { isTypeOfString } from '@neodx/std';
import { redefineName } from '@neodx/std/shared';

export const linkError = (error: unknown, cause?: unknown) =>
  isTypeOfString(error) ? new Error(error, { cause }) : error ?? cause;

export const createErrorType = <Name extends string>(name: Name) => {
  const ErrorType = class extends Error {
    static child = <ChildName extends string>(childName: ChildName) =>
      createErrorType<`${Name}.${ChildName}`>(`${name}.${childName}`);

    constructor(message: string, options?: ErrorOptions) {
      super(message, options);
      this.name = name;
    }
  };

  redefineName(ErrorType, name);
  return ErrorType;
};
