import type { AnsweredQuestion } from '@/types';
import styles from './MissedQuestions.module.css';

interface MissedQuestionsProps {
  answers: AnsweredQuestion[];
}

export function MissedQuestions({ answers }: MissedQuestionsProps) {
  const missed = answers.filter((a) => !a.isCorrect);

  if (missed.length === 0) {
    return (
      <p className={styles.allCorrect} data-testid="all-correct">
        You got everything right — nothing to review.
      </p>
    );
  }

  return (
    <div data-testid="missed-questions">
      <h2 className={styles.heading}>Review your misses ({missed.length})</h2>
      <ol className={styles.list}>
        {missed.map((answer) => (
          <li key={answer.questionId} className={styles.item}>
            <p className={styles.prompt}>{answer.prompt}</p>
            <p className={styles.answerRow}>
              <span className={styles.label}>Your answer</span>
              <span className={styles.wrong}>{answer.selectedText}</span>
            </p>
            <p className={styles.answerRow}>
              <span className={styles.label}>Correct answer</span>
              <span className={styles.correct}>{answer.correctText}</span>
            </p>
            {answer.explanation && <p className={styles.explanation}>{answer.explanation}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
