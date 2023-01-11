export const sum = (a: number, b: number) => a + b;
export const div = (a: number, b: number) => a / b;

export interface Shared {
  foo: string;
}

export interface NotShared {
  bar: string;
}
