import clsx from 'clsx';
import type { ComponentProps } from 'react';
import { styles } from './shared.ts';

export const Select = (props: ComponentProps<'select'>) => {
  return <select {...props} className={clsx(styles.control, props.className)} />;
};
