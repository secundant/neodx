import { z } from 'zod';

export const parseAs = <T extends z.ZodTypeAny>(name: string, schema: T, value: unknown) => {
  try {
    return schema.parse(value) as z.infer<T>;
  } catch (error) {
    throw new Error(`Wrong value for "${name}": ${(error as z.ZodError).message}`, {
      cause: error
    });
  }
};
