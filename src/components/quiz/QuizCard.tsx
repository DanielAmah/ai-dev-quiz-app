import { Link } from 'react-router-dom';
import type { QuizSummary } from '@/types';
import styles from './QuizCard.module.css';

interface QuizCardProps {
  quiz: QuizSummary;
}

const difficultyLabel: Record<QuizSummary['difficulty'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function QuizCard({ quiz }: QuizCardProps) {
  const headingId = `quiz-${quiz.id}-title`;

  return (
    <article className={styles.card} aria-labelledby={headingId}>
      <div className={styles.header}>
        <span className={styles.category}>{quiz.category}</span>
        <span
          className={`${styles.badge} ${styles[quiz.difficulty]}`}
          data-testid="difficulty-badge"
        >
          {difficultyLabel[quiz.difficulty]}
        </span>
      </div>
      <h3 id={headingId} className={styles.title}>
        {quiz.title}
      </h3>
      <p className={styles.description}>{quiz.description}</p>
      <dl className={styles.meta}>
        <div className={styles.metaItem}>
          <dt>Questions</dt>
          <dd>{quiz.questionCount}</dd>
        </div>
        <div className={styles.metaItem}>
          <dt>Time</dt>
          <dd>{quiz.estimatedMinutes} min</dd>
        </div>
      </dl>
      <div className={styles.footer}>
        <Link
          to={`/quiz/${quiz.id}`}
          className={styles.startLink}
          aria-label={`Start quiz: ${quiz.title}`}
        >
          Start quiz
        </Link>
      </div>
    </article>
  );
}
