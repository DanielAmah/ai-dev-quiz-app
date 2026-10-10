import { formatPercent, formatScore } from '@/utils/format';
import styles from './ScoreRing.module.css';

interface ScoreRingProps {
  score: number;
  total: number;
  percentage: number;
}

/** Circular progress ring showing a quiz score and percentage. */
export function ScoreRing({ score, total, percentage }: ScoreRingProps) {
  const pct = Math.max(0, Math.min(100, Math.round(percentage)));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = (pct / 100) * circumference;

  return (
    <div
      className={styles.ring}
      role="img"
      aria-label={`Scored ${score} out of ${total}, ${pct} percent`}
    >
      <svg viewBox="0 0 120 120" className={styles.ringSvg} aria-hidden="true">
        <circle className={styles.ringTrack} cx="60" cy="60" r={radius} />
        <circle
          className={styles.ringProgress}
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className={styles.ringLabel}>
        <span className={styles.percentage}>{formatPercent(pct)}</span>
        <span className={styles.fraction}>{formatScore(score, total)}</span>
      </div>
    </div>
  );
}
