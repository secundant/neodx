import { multiply } from '@/private/util';
import { foo } from '@/public/foo';

export function bar(value: number) {
  return multiply(foo(), value);
}
