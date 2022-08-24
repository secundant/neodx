// eslint-disable-next-line import/no-unresolved
import { clsx } from '@/internal/clsx';

export const withFoo = (fn: () => string | number) => clsx(fn(), 'bar');
