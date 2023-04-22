import { createColors } from './create-colors';

export type { ColorFormatter, ColorName, Colors } from './create-colors';

export const colors = createColors(true);
export { createColors };
