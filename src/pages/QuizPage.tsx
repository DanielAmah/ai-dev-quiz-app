import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { ErrorState, LoadingState } from '@/components/common/StateMessage';
import { QuestionView } from '@/components/quiz/QuestionView';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { useAsync } from '@/hooks/useAsync';
import { fetchQuiz } from '@/services/quizApi';
import { useQuizSession } from '@/features/quiz/useQuizSession';
import type { Quiz, QuizMode } from '@/types';
import { describeError } from '@/utils/errorMessages';
import styles from './QuizPage.module.css';

export default function QuizPage() {
  const { quizId = '' } = useParams();
  const load = useCallback((signal: AbortSignal) => fetchQuiz(quizId, signal), [quizId]);
  const { status, data, error, reload } = useAsync<Quiz>(load, [quizId]);

  if (status === 'loading' || status === 'idle') return <LoadingState label="Loading quiz…" />;
  if (status === 'error' || !data) {
    return (
      <ErrorState
        description={describeError(error)}
        action={
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={reload}>
              Try again
            </Button>
            <Link to="/">
              <Button variant="ghost">Back to quizzes</Button>
            </Link>
          </div>
        }
      />
    );
  }

  // Key by quiz id so switching quizzes remounts the session cleanly.
  return <QuizRunner key={data.id} quiz={data} />;
}

function QuizRunner({ quiz }: { quiz: Quiz }) {
  const navigate = useNavigate();
  const { state, resumed, dispatch, start, savedAttempt } = useQuizSession(quiz);
  const [mode, setMode] = useState<QuizMode>('standard');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // When the attempt completes, go to its results page.
  const completedId = state?.status === 'completed' ? savedAttempt?.id : undefined;
  useEffect(() => {
    if (completedId) navigate(`/results/${completedId}`, { replace: true });
  }, [completedId, navigate]);

  if (!state) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.header}>
            <span className={styles.category}>{quiz.category}</span>
            <h1 className={styles.title}>{quiz.title}</h1>
            <p className={styles.description}>{quiz.description}</p>
          </div>
          <div className={styles.start}>
            <p className={styles.hint}>
              {quiz.questionCount} questions · about {quiz.estimatedMinutes} min · {quiz.difficulty}
            </p>
            <fieldset className={styles.options}>
              <legend className={styles.hint}>Options</legend>
              <div className={styles.optionRow}>
                <input
                  id="learn-mode"
                  type="checkbox"
                  checked={mode === 'learn'}
                  onChange={(e) => setMode(e.target.checked ? 'learn' : 'standard')}
                />
                <label htmlFor="learn-mode">
                  Learn mode — show the explanation before you answer
                </label>
              </div>
              <div className={styles.optionRow}>
                <input
                  id="shuffle"
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                />
                <label htmlFor="shuffle">Shuffle question order</label>
              </div>
            </fieldset>
            <Button onClick={() => start({ mode, shuffleQuestions })}>Start quiz</Button>
            <Link to="/" className={styles.hint}>
              ← Back to all quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const byId = new Map(quiz.questions.map((q) => [q.id, q]));
  const currentId = state.questionOrder[state.currentIndex]!;
  const currentQuestion = byId.get(currentId)!;
  const selectedOptionId = state.answers[currentId];
  const answeredCount = Object.keys(state.answers).length;
  const isLast = state.currentIndex === state.questionOrder.length - 1;
  const canProceed = selectedOptionId !== undefined;

  return (
    <div className={styles.page}>
      {resumed && (
        <div className={styles.banner} role="status">
          <span>Welcome back — we picked up where you left off.</span>
        </div>
      )}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.category}>{quiz.title}</span>
        </div>
        <ProgressBar
          current={state.currentIndex + 1}
          total={state.questionOrder.length}
          answered={answeredCount}
        />
        <div style={{ marginTop: 'var(--space-5)' }}>
          <QuestionView
            question={currentQuestion}
            selectedOptionId={selectedOptionId}
            revealBeforeAnswer={state.mode === 'learn'}
            onAnswer={(optionId) => dispatch({ type: 'answer', questionId: currentId, optionId })}
          />
        </div>
        <div className={styles.footer}>
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: 'previous' })}
            disabled={state.currentIndex === 0}
          >
            ← Previous
          </Button>
          <span className={styles.spacer} />
          {isLast ? (
            <Button onClick={() => dispatch({ type: 'finish' })} disabled={!canProceed}>
              Finish quiz
            </Button>
          ) : (
            <Button onClick={() => dispatch({ type: 'next' })} disabled={!canProceed}>
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
