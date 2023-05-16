export type URLInit = URL | string;

export const createRelativeUrl = (path: string, baseUrl: string) =>
  new URL(path.replace(firstSlash, ''), baseUrl.replace(lastSlash, '') + '/');

export const addSearchParams = (
  searchParams: URLSearchParams,
  params?: Record<string, unknown>,
  method: 'append' | 'set' = 'append'
) => {
  if (!params) return;
  for (const [key, value] of Object.entries(params)) {
    searchParams[method](key, String(value));
  }
};

const firstSlash = /^\/+/;
const lastSlash = /\/+$/;
