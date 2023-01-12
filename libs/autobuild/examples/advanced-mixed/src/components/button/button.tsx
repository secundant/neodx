// eslint-disable-next-line import/no-unresolved
import { clsx } from '@/utils/clsx';
import styles from './button.module.scss';

export interface ButtonProps {
  className?: string;
  label?: string;
}

export function Button({ className, label }: ButtonProps) {
  return <button className={clsx(styles.root, className)}>{label}</button>;
}
