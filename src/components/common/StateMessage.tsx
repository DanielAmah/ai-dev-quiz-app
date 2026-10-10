import type { ReactNode } from 'react';
import { Spinner } from './Spinner';
import styles from './StateMessage.module.css';

interface StateMessageProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className={styles.container} data-testid="loading-state">
      <Spinner label={label} />
      <p className={styles.description}>{label}</p>
    </div>
  );
}

export function EmptyState({ title, description, action, icon }: StateMessageProps) {
  return (
    <div className={styles.container} data-testid="empty-state">
      {icon && <div className={styles.icon}>{icon}</div>}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  action,
}: Partial<StateMessageProps>) {
  return (
    <div className={`${styles.container} ${styles.error}`} role="alert" data-testid="error-state">
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
