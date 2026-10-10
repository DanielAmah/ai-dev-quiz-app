import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number; // 1-based position
  total: number;
  answered: number;
}

export function ProgressBar({ current, total, answered }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100);
  return (
    <div className={styles.wrapper}>
      <div className={styles.labels}>
        <span>
          Question {current} of {total}
        </span>
        <span className={styles.muted}>{answered} answered</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={answered}
        aria-label={`${answered} of ${total} questions answered`}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
