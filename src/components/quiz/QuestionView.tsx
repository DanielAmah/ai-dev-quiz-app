import type { Question } from '@/types';
import styles from './QuestionView.module.css';

interface QuestionViewProps {
  question: Question;
  selectedOptionId: string | undefined;
  /** Learn mode reveals the explanation before an answer is chosen. */
  revealBeforeAnswer: boolean;
  onAnswer: (optionId: string) => void;
}

export function QuestionView({
  question,
  selectedOptionId,
  revealBeforeAnswer,
  onAnswer,
}: QuestionViewProps) {
  const answered = selectedOptionId !== undefined;
  const showFeedback = answered;

  return (
    <div className={styles.question}>
      <fieldset className={styles.fieldset} disabled={answered}>
        <legend className={styles.prompt}>{question.prompt}</legend>
        <div className={styles.options} role="radiogroup" aria-label="Answer options">
          {question.options.map((option) => {
            const isSelected = option.id === selectedOptionId;
            const isCorrect = option.id === question.correctOptionId;
            const state =
              showFeedback && isCorrect
                ? styles.correct
                : showFeedback && isSelected && !isCorrect
                  ? styles.incorrect
                  : '';
            return (
              <label key={option.id} className={`${styles.option} ${state}`}>
                <input
                  type="radio"
                  name={question.id}
                  value={option.id}
                  checked={isSelected}
                  disabled={answered}
                  onChange={() => onAnswer(option.id)}
                  className={styles.radio}
                />
                <span className={styles.optionText}>{option.text}</span>
                {showFeedback && isCorrect && (
                  <span className={styles.tag} aria-hidden="true">
                    ✓ Correct
                  </span>
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <span className={styles.tag} aria-hidden="true">
                    ✗ Your answer
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {(showFeedback || revealBeforeAnswer) && (
        <div
          className={`${styles.explanation} ${
            showFeedback
              ? selectedOptionId === question.correctOptionId
                ? styles.explainCorrect
                : styles.explainIncorrect
              : styles.explainNeutral
          }`}
          role="status"
        >
          <strong>
            {!showFeedback
              ? 'Explanation'
              : selectedOptionId === question.correctOptionId
                ? 'Correct!'
                : 'Not quite.'}
          </strong>{' '}
          {question.explanation}
        </div>
      )}
    </div>
  );
}
