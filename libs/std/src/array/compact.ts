export const compact = <T>(values: Array<T | FalsyLike>): T[] => values.filter(Boolean as any);

export type FalsyLike = '' | 0 | false | null | undefined;
