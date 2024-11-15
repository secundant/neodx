import clsx from 'clsx';
import type { ComponentProps } from 'react';
import { styles } from './shared.ts';

export const Input = (props: ComponentProps<'input'>) => {
  return <input type="text" {...props} className={clsx(styles.control, props.className)} />;
};
