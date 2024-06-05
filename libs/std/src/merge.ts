import { isArray, isObject } from './guards.ts';
import { entries, hasOwn } from './shared.ts';

export const merge = <const Source extends object, const Overrides extends [...object[]]>(
  source: Source,
  ...overrides: [...Overrides]
  // eslint-disable-next-line @typescript-eslint/ban-types
): Merge<Source, Overrides> & {} => {
  overrides.forEach(target => mergeObject(source, target));
  return source as any;
};

export type Merge<Source extends object, Overrides extends [...object[]]> = Overrides extends [
  infer Target extends object,
  ...infer Rest extends [...object[]]
]
  ? Merge<MergeObject<Source, Target>, Rest>
  : Source;

export type MergeUnknown<Source, Target> = Target extends object
  ? Source extends object
    ? MergeObject<Source, Target>
    : Target
  : Target extends unknown[]
    ? Source extends unknown[]
      ? MergeArray<Source, Target>
      : Target
    : Target;
export type MergeObject<Source extends object, Target extends object> = {
  [Key in keyof Source]: Key extends keyof Target
    ? MergeUnknown<Source[Key], Target[Key]>
    : Source[Key];
} & {
  [Key in Exclude<keyof Target, keyof Source>]: Target[Key];
};
export type MergeArray<Source extends unknown[], Target extends unknown[]> = [
  ...{
    [Index in keyof Source]: Index extends keyof Target
      ? MergeUnknown<Source[Index], Target[Index]>
      : Source[Index];
  },
  ...{
    [Index in keyof Target]: Index extends keyof Source ? never : Target[Index];
  }
];

const mergeUnknown = <Source, Target>(
  source: Source,
  target: Target
): MergeUnknown<Source, Target> => {
  if (isObject(target)) return isObject(source) ? (mergeObject(source, target) as any) : target;
  if (isArray(target)) return isArray(source) ? (mergeArray(source, target) as any) : target;
  return target as any;
};

const mergeObject = <Source extends object, Target extends object>(
  source: Source,
  target: Target
) => {
  for (const [key, value] of entries(target)) {
    (source as Source & Target)[key] = hasOwn(source, key)
      ? (mergeUnknown(source[key], value) as any)
      : value;
  }
  return source as Source & Target;
};

const mergeArray = <Source extends unknown[], Target extends unknown[]>(
  source: Source,
  target: Target
) => {
  source.forEach((value, index) =>
    target.length > index ? mergeUnknown(value, target[index]) : value
  );
  source.push(...target.slice(source.length));
  return source;
};
