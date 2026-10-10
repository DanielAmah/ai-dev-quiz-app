import type { AttemptRecord } from '@/types';
import styles from './ProgressChart.module.css';

interface ProgressChartProps {
  /** Attempts in chronological order (oldest first). */
  attempts: AttemptRecord[];
}

const WIDTH = 600;
const HEIGHT = 200;
const PAD = 24;

function describeTrend(attempts: AttemptRecord[]): string {
  if (attempts.length === 0) return 'No attempts recorded.';
  const first = attempts[0]!.percentage;
  const last = attempts[attempts.length - 1]!.percentage;
  const direction = last > first ? 'improving' : last < first ? 'declining' : 'steady';
  return `Score over ${attempts.length} attempt${
    attempts.length === 1 ? '' : 's'
  }, from ${Math.round(first)}% to ${Math.round(last)}% (${direction}).`;
}

export function ProgressChart({ attempts }: ProgressChartProps) {
  const label = describeTrend(attempts);
  const count = attempts.length;

  const plotWidth = WIDTH - PAD * 2;
  const plotHeight = HEIGHT - PAD * 2;

  const x = (i: number) => (count <= 1 ? WIDTH / 2 : PAD + (i / (count - 1)) * plotWidth);
  const y = (pct: number) => PAD + (1 - pct / 100) * plotHeight;

  const points = attempts.map((a, i) => ({ cx: x(i), cy: y(a.percentage), pct: a.percentage }));
  const polyline = points.map((p) => `${p.cx},${p.cy}`).join(' ');

  return (
    <figure className={styles.figure}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={styles.svg}
        role="img"
        aria-label={label}
        preserveAspectRatio="none"
      >
        <title>{label}</title>
        {[0, 50, 100].map((gridPct) => (
          <g key={gridPct}>
            <line
              className={styles.gridLine}
              x1={PAD}
              x2={WIDTH - PAD}
              y1={y(gridPct)}
              y2={y(gridPct)}
            />
            <text className={styles.gridLabel} x={0} y={y(gridPct) + 4}>
              {gridPct}
            </text>
          </g>
        ))}
        {count > 1 && <polyline className={styles.line} points={polyline} />}
        {points.map((p, i) => (
          <circle key={i} className={styles.point} cx={p.cx} cy={p.cy} r={4} />
        ))}
      </svg>
      <figcaption className={styles.caption}>{label}</figcaption>
    </figure>
  );
}
