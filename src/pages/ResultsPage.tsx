import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/StateMessage';
import { MissedQuestions } from '@/components/results/MissedQuestions';
import { PerformanceMessage } from '@/components/results/PerformanceMessage';
import { useHistory } from '@/context/HistoryContext';
import styles from './ResultsPage.module.css';

export default function ResultsPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { attempts } = useHistory();

  const attempt = attempts.find((a) => a.id === attemptId);

  if (!attempt) {
    return (
      <EmptyState
        title="Result not found"
        description="We could not find that attempt. It may have been cleared from your history."
        action={
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to quizzes
          </Button>
        }
      />
    );
  }

  const percentage = Math.round(attempt.percentage);
  const circumference = 2 * Math.PI * 52;
  const dash = (percentage / 100) * circumference;

  return (
    <section className={styles.page} aria-labelledby="results-heading">
      <header className={styles.header}>
        <h1 id="results-heading" className={styles.quizTitle}>
          {attempt.quizTitle}
        </h1>
        <p className={styles.category}>{attempt.category}</p>
      </header>

      <div className={styles.scorePanel}>
        <div
          className={styles.ring}
          role="img"
          aria-label={`Scored ${attempt.score} out of ${attempt.total}, ${percentage} percent`}
        >
          <svg viewBox="0 0 120 120" className={styles.ringSvg} aria-hidden="true">
            <circle className={styles.ringTrack} cx="60" cy="60" r="52" />
            <circle
              className={styles.ringProgress}
              cx="60"
              cy="60"
              r="52"
              strokeDasharray={`${dash} ${circumference}`}
            />
          </svg>
          <div className={styles.ringLabel}>
            <span className={styles.percentage}>{percentage}%</span>
            <span className={styles.fraction}>
              {attempt.score} / {attempt.total}
            </span>
          </div>
        </div>
        <PerformanceMessage percentage={attempt.percentage} />
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={() => navigate(`/quiz/${attempt.quizId}`)}>
          Retake quiz
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to quizzes
        </Button>
        <Link to="/history" className={styles.historyLink}>
          View history
        </Link>
      </div>

      <section className={styles.review} aria-label="Answer review">
        <MissedQuestions answers={attempt.answers} />
      </section>
    </section>
  );
}
