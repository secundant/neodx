// eslint-disable-next-line import/no-unresolved
import { AriaAttributes, ChangeEvent } from 'react';
import { clsx } from '@/utils/clsx';
// @ts-expect-error ignoring modules
import styles from './input.module.scss';

export interface InputProps extends AriaAttributes {
  className?: string;
  value: string;
  onChange(e: ChangeEvent<HTMLInputElement>): void;
}

export function Input({ className, ...props }: InputProps) {
  return <input className={clsx(styles.root, className)} {...props} />;
}
