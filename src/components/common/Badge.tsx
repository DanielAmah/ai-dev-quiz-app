import type { ReactNode } from 'react';
import type { Difficulty } from '@/types';
import styles from './Badge.module.css';

type BadgeTone = 'neutral' | 'beginner' | 'intermediate' | 'advanced';

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** The difficulty pill shown on quiz cards. */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span data-testid="difficulty-badge">
      <Badge tone={difficulty}>{DIFFICULTY_LABEL[difficulty]}</Badge>
    </span>
  );
}
