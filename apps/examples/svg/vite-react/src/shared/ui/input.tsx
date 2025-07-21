import clsx from 'clsx';
import type { ComponentProps } from 'react';
import { styles } from './shared.ts';

export type InputProps = ComponentProps<'input'>;

export const Input = (props: InputProps) => {
  return <input type="text" {...props} className={clsx(styles.control, props.className)} />;
};
