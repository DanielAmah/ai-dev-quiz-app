import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/StateMessage';
import { ProgressChart } from '@/components/history/ProgressChart';
import { useHistory } from '@/state';
import { perQuizBests, summariseHistory } from '@/utils/performance';
import { formatDate, formatPercent, formatScoreLine, pluralizeAttempts } from '@/utils/format';
import styles from './HistoryPage.module.css';

export default function HistoryPage() {
  const navigate = useNavigate();
  const { attempts, clearHistory } = useHistory();

  if (attempts.length === 0) {
    return (
      <EmptyState
        title="No attempts yet"
        description="Finish a quiz and your progress will show up here."
        action={
          <Button variant="primary" onClick={() => navigate('/')}>
            Browse quizzes
          </Button>
        }
      />
    );
  }

  const summary = summariseHistory(attempts);
  const bests = perQuizBests(attempts);
  // attempts is newest-first; the chart wants oldest-first.
  const chronological = [...attempts].reverse();

  const handleClear = () => {
    if (window.confirm('Clear all attempt history? This cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <section className={styles.page} aria-labelledby="history-heading">
      <header className={styles.header}>
        <h1 id="history-heading" className={styles.title}>
          Your progress
        </h1>
        <Button variant="danger" onClick={handleClear}>
          Clear history
        </Button>
      </header>

      <dl className={styles.summary}>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Attempts</dt>
          <dd className={styles.statValue}>{summary.totalAttempts}</dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Best score</dt>
          <dd className={styles.statValue}>{formatPercent(summary.bestPercentage)}</dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>Average score</dt>
          <dd className={styles.statValue}>{formatPercent(summary.averagePercentage)}</dd>
        </div>
      </dl>

      <ProgressChart attempts={chronological} />

      <section aria-labelledby="per-quiz-heading">
        <h2 id="per-quiz-heading" className={styles.sectionTitle}>
          Personal bests
        </h2>
        <ul className={styles.bestList}>
          {bests.map((best) => (
            <li key={best.quizId} className={styles.bestItem}>
              <div>
                <p className={styles.bestTitle}>{best.quizTitle}</p>
                <p className={styles.bestMeta}>{best.category}</p>
              </div>
              <div className={styles.bestRight}>
                <span className={styles.bestPercent}>{formatPercent(best.bestPercentage)}</span>
                <span className={styles.bestMeta}>{pluralizeAttempts(best.attemptCount)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="attempts-heading">
        <h2 id="attempts-heading" className={styles.sectionTitle}>
          All attempts
        </h2>
        <ul className={styles.attemptList}>
          {attempts.map((attempt) => (
            <li key={attempt.id} className={styles.attemptItem}>
              <Link to={`/results/${attempt.id}`} className={styles.attemptLink}>
                <div>
                  <p className={styles.attemptTitle}>{attempt.quizTitle}</p>
                  <p className={styles.attemptMeta}>
                    {attempt.category} · {formatDate(attempt.completedAt)}
                  </p>
                </div>
                <span className={styles.attemptScore}>
                  {formatScoreLine(attempt.score, attempt.total, attempt.percentage)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
