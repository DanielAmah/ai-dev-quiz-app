import type { QuizSession } from '@/types';
import type { QuizState } from '@/state/quiz/quizReducer';
import { readValue, removeValue, writeValue } from '@/services/storage';

/**
 * The single active, resumable quiz attempt. Stored separately from history so
 * an interrupted quiz can be restored on reload, then cleared when it finishes.
 */
const KEY = 'active-session';
const VERSION = 1;

function isQuizSession(v: unknown): v is QuizSession {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    s.schemaVersion === 1 &&
    typeof s.attemptId === 'string' &&
    typeof s.quizId === 'string' &&
    typeof s.quizVersion === 'number' &&
    (s.mode === 'standard' || s.mode === 'learn') &&
    Array.isArray(s.questionOrder) &&
    s.questionOrder.every((id) => typeof id === 'string') &&
    typeof s.currentIndex === 'number' &&
    s.currentIndex >= 0 &&
    s.currentIndex < (s.questionOrder as unknown[]).length &&
    typeof s.answers === 'object' &&
    s.answers !== null &&
    (s.status === 'in-progress' || s.status === 'completed') &&
    typeof s.startedAt === 'string'
  );
}

export function loadSession(): QuizSession | null {
  return readValue(KEY, VERSION, isQuizSession);
}

export function saveSession(attemptId: string, state: QuizState): void {
  const session: QuizSession = {
    schemaVersion: 1,
    attemptId,
    quizId: state.quizId,
    quizVersion: state.quizVersion,
    mode: state.mode,
    questionOrder: state.questionOrder,
    currentIndex: state.currentIndex,
    answers: state.answers,
    status: state.status,
    startedAt: state.startedAt,
    completedAt: state.completedAt,
  };
  writeValue(KEY, VERSION, session);
}

export function clearSession(): void {
  removeValue(KEY);
}
