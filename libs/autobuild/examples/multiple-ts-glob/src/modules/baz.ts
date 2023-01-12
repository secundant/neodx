// eslint-disable-next-line import/no-unresolved
import { calc } from '@/internal/calc';
// eslint-disable-next-line import/no-unresolved
import { foo } from '@/modules/foo';

export const baz = () => calc(foo());
