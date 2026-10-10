import styles from './Spinner.module.css';

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.visuallyHidden}>{label}</span>
    </span>
  );
}
