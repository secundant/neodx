import { AriaAttributes, ChangeEvent } from 'react';
// eslint-disable-next-line import/no-unresolved
import { clsx } from '@/utils/clsx';
import styles from './input.module.scss';

export interface InputProps extends AriaAttributes {
  className?: string;
  value: string;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
}

export function Input({ className, ...props }: InputProps) {
  return <input className={clsx(styles.root, className)} {...props} />;
}
