// @ts-expect-error ignoring modules
import styles from './element.module.css';

export function element() {
  return {
    className: styles.name
  };
}
