import type { AttemptRecord } from '@/types';

export type ScoreBand = 'outstanding' | 'great' | 'good' | 'practising';

export interface PerformanceResult {
  band: ScoreBand;
  title: string;
  message: string;
}

/**
 * Map a percentage score (0–100) to a performance band with a title and an
 * encouraging message. Bands are inclusive at their lower bound:
 * ≥90 outstanding, ≥70 great, ≥50 good, otherwise keep practising.
 */
export function getPerformance(percentage: number): PerformanceResult {
  if (percentage >= 90) {
    return {
      band: 'outstanding',
      title: 'Outstanding',
      message: 'Exceptional work — you have a strong command of this material.',
    };
  }
  if (percentage >= 70) {
    return {
      band: 'great',
      title: 'Great work',
      message: 'A solid result. A little review and you will have this nailed.',
    };
  }
  if (percentage >= 50) {
    return {
      band: 'good',
      title: 'Good effort',
      message: 'You are on the right track. Revisit the misses and try again.',
    };
  }
  return {
    band: 'practising',
    title: 'Keep practising',
    message: 'Every attempt builds understanding. Review the answers and give it another go.',
  };
}

export interface HistorySummary {
  totalAttempts: number;
  bestPercentage: number;
  averagePercentage: number;
}

/** Summary statistics across a set of attempts. Safe on an empty list. */
export function summariseHistory(attempts: AttemptRecord[]): HistorySummary {
  if (attempts.length === 0) {
    return { totalAttempts: 0, bestPercentage: 0, averagePercentage: 0 };
  }
  const percentages = attempts.map((a) => a.percentage);
  const best = Math.max(...percentages);
  const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
  return {
    totalAttempts: attempts.length,
    bestPercentage: Math.round(best),
    averagePercentage: Math.round(average),
  };
}

export interface QuizBest {
  quizId: string;
  quizTitle: string;
  category: string;
  bestPercentage: number;
  attemptCount: number;
}

/**
 * Group attempts by quiz and report each quiz's personal best and attempt
 * count. Ordered by best percentage descending, then title.
 */
export function perQuizBests(attempts: AttemptRecord[]): QuizBest[] {
  const byQuiz = new Map<string, QuizBest>();
  for (const attempt of attempts) {
    const existing = byQuiz.get(attempt.quizId);
    if (existing) {
      existing.bestPercentage = Math.max(existing.bestPercentage, Math.round(attempt.percentage));
      existing.attemptCount += 1;
    } else {
      byQuiz.set(attempt.quizId, {
        quizId: attempt.quizId,
        quizTitle: attempt.quizTitle,
        category: attempt.category,
        bestPercentage: Math.round(attempt.percentage),
        attemptCount: 1,
      });
    }
  }
  return [...byQuiz.values()].sort(
    (a, b) => b.bestPercentage - a.bestPercentage || a.quizTitle.localeCompare(b.quizTitle),
  );
}
