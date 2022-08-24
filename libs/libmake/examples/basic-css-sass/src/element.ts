// @ts-expect-error ignoring modules
import styles from './element.module.scss';

export function element() {
  return { className: styles.name };
}
