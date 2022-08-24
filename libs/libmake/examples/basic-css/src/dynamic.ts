import './dynamic.global.css';
// @ts-expect-error ignoring modules
import styles from './dynamic.module.css';

export function dynamic() {
  return {
    className: styles.dynamic
  };
}
