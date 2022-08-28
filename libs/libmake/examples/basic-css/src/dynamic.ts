import './dynamic.global.css';
import styles from './dynamic.module.css';

export function dynamic() {
  return {
    className: styles.dynamic
  };
}
