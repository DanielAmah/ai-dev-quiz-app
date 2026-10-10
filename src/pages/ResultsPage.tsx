import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/StateMessage';
import { MissedQuestions } from '@/components/results/MissedQuestions';
import { PerformanceMessage } from '@/components/results/PerformanceMessage';
import { ScoreRing } from '@/components/common/ScoreRing';
import { useHistory } from '@/state';
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

  return (
    <section className={styles.page} aria-labelledby="results-heading">
      <header className={styles.header}>
        <h1 id="results-heading" className={styles.quizTitle}>
          {attempt.quizTitle}
        </h1>
        <p className={styles.category}>{attempt.category}</p>
      </header>

      <div className={styles.scorePanel}>
        <ScoreRing score={attempt.score} total={attempt.total} percentage={attempt.percentage} />
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
