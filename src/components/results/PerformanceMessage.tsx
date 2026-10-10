import { getPerformance } from '@/utils/performance';
import styles from './PerformanceMessage.module.css';

interface PerformanceMessageProps {
  percentage: number;
}

export function PerformanceMessage({ percentage }: PerformanceMessageProps) {
  const { band, title, message } = getPerformance(percentage);
  return (
    <div className={styles.container} data-band={band} data-testid="performance-message">
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
