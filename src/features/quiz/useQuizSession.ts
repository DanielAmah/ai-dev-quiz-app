import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { AttemptRecord, Quiz, QuizMode } from '@/types';
import { useHistory } from '@/context/HistoryContext';
import { clearSession, loadSession, saveSession } from '@/services/sessionStore';
import { createId } from '@/utils/id';
import { buildAttempt } from './buildAttempt';
import { createInitialState, quizReducer, type QuizAction, type QuizState } from './quizReducer';

export interface StartOptions {
  mode: QuizMode;
  shuffleQuestions: boolean;
}

/** A reset action is handled by the hook's wrapper, not the pure reducer. */
type SessionAction = QuizAction | { type: '@reset'; state: QuizState };

function sessionReducer(state: QuizState | null, action: SessionAction): QuizState | null {
  if (action.type === '@reset') return action.state;
  if (state === null) return null;
  return quizReducer(state, action);
}

/**
 * Restore a saved attempt for this quiz, if it is still valid. A session is
 * resumable only when it is in-progress, belongs to this quiz, matches the
 * quiz version, and its question order is a permutation of the quiz's current
 * questions. Anything else is stale and discarded.
 */
function restore(quiz: Quiz): { state: QuizState; attemptId: string } | null {
  const session = loadSession();
  if (!session || session.quizId !== quiz.id || session.status !== 'in-progress') return null;
  if (session.quizVersion !== quiz.version) {
    clearSession();
    return null;
  }
  const ids = new Set(quiz.questions.map((q) => q.id));
  const sameSet =
    session.questionOrder.length === ids.size && session.questionOrder.every((id) => ids.has(id));
  if (!sameSet) {
    clearSession();
    return null;
  }
  return {
    attemptId: session.attemptId,
    state: {
      quizId: session.quizId,
      quizVersion: session.quizVersion,
      mode: session.mode,
      questionOrder: session.questionOrder,
      currentIndex: session.currentIndex,
      answers: session.answers,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    },
  };
}

export interface UseQuizSession {
  state: QuizState | null;
  resumed: boolean;
  dispatch: (action: QuizAction) => void;
  start: (options: StartOptions) => void;
  savedAttempt: AttemptRecord | null;
}

/**
 * Ties the pure reducer to persistence and history:
 *  - restores an in-progress attempt on mount (resume after refresh),
 *  - persists the active session on every change,
 *  - on completion, records the attempt in history and clears the session,
 *    exactly once.
 */
export function useQuizSession(quiz: Quiz): UseQuizSession {
  const { addAttempt } = useHistory();

  // Restore once (lazy initial state) so the reducer, attempt id and resumed
  // flag all agree on the same restored session.
  const [restored] = useState(() => restore(quiz));

  const [attemptId, setAttemptId] = useState<string>(() => restored?.attemptId ?? createId());
  const [resumed, setResumed] = useState(() => restored !== null);
  const [savedAttempt, setSavedAttempt] = useState<AttemptRecord | null>(null);
  const [state, dispatch] = useReducer(sessionReducer, restored?.state ?? null);
  const recordedRef = useRef(false);

  const start = useCallback(
    (options: StartOptions) => {
      const next = createInitialState({
        quiz,
        mode: options.mode,
        shuffleQuestions: options.shuffleQuestions,
      });
      const id = createId();
      recordedRef.current = false;
      setAttemptId(id);
      setResumed(false);
      setSavedAttempt(null);
      saveSession(id, next);
      dispatch({ type: '@reset', state: next });
    },
    [quiz],
  );

  // Persist on every in-progress change.
  useEffect(() => {
    if (state && state.status === 'in-progress') saveSession(attemptId, state);
  }, [state, attemptId]);

  // On completion: record once, then clear the active session.
  useEffect(() => {
    if (state?.status === 'completed' && !recordedRef.current) {
      recordedRef.current = true;
      const attempt = { ...buildAttempt(quiz, state), id: attemptId };
      addAttempt(attempt);
      setSavedAttempt(attempt);
      clearSession();
    }
  }, [state, quiz, attemptId, addAttempt]);

  return { state, resumed, dispatch, start, savedAttempt };
}
