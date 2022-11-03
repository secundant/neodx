export const resolveRoot = (path: string) => new URL(path, new URL('..', import.meta.url)).pathname;
