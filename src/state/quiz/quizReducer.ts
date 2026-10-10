import type { Quiz, QuizMode } from '@/types';
import { shuffle } from '@/utils/shuffle';

/**
 * Pure state machine for an in-progress quiz attempt.
 *
 * Correctness guarantees enforced here (verified by unit + e2e tests):
 *  - An answer is recorded exactly once per question. Re-answering the same
 *    question is ignored, so a rapid double-click cannot change the outcome.
 *  - `next`/`finish` are guarded against the current index and status, so
 *    rapid repeats cannot skip a question or advance past the end.
 *  - The score is never stored; it is derived from `answers` on demand, so it
 *    is impossible to double-count.
 */

export interface QuizState {
  quizId: string;
  quizVersion: number;
  mode: QuizMode;
  questionOrder: string[];
  currentIndex: number;
  answers: Record<string, string>;
  status: 'in-progress' | 'completed';
  startedAt: string;
  completedAt?: string;
}

export type QuizAction =
  | { type: 'answer'; questionId: string; optionId: string }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'finish'; now?: () => string };

export interface InitConfig {
  quiz: Quiz;
  mode: QuizMode;
  shuffleQuestions: boolean;
  now?: () => string;
  rng?: () => number;
}

export function createInitialState({
  quiz,
  mode,
  shuffleQuestions,
  now = () => new Date().toISOString(),
  rng = Math.random,
}: InitConfig): QuizState {
  const ids = quiz.questions.map((question) => question.id);
  return {
    quizId: quiz.id,
    quizVersion: quiz.version,
    mode,
    questionOrder: shuffleQuestions ? shuffle(ids, rng) : ids,
    currentIndex: 0,
    answers: {},
    status: 'in-progress',
    startedAt: now(),
  };
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  if (state.status === 'completed') return state;

  switch (action.type) {
    case 'answer': {
      const currentQuestionId = state.questionOrder[state.currentIndex];
      // Only the current question may be answered, and only once.
      if (action.questionId !== currentQuestionId) return state;
      if (state.answers[action.questionId] !== undefined) return state;
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionId },
      };
    }

    case 'next': {
      const currentQuestionId = state.questionOrder[state.currentIndex];
      // Cannot advance until the current question is answered (standard mode),
      // and cannot advance past the last question with `next`.
      if (currentQuestionId !== undefined && state.answers[currentQuestionId] === undefined) {
        return state;
      }
      if (state.currentIndex >= state.questionOrder.length - 1) return state;
      return { ...state, currentIndex: state.currentIndex + 1 };
    }

    case 'previous': {
      if (state.currentIndex <= 0) return state;
      return { ...state, currentIndex: state.currentIndex - 1 };
    }

    case 'finish': {
      // Finish only from the last question, and only when it is answered.
      if (state.currentIndex !== state.questionOrder.length - 1) return state;
      const lastQuestionId = state.questionOrder[state.currentIndex];
      if (lastQuestionId !== undefined && state.answers[lastQuestionId] === undefined) {
        return state;
      }
      const now = action.now ?? (() => new Date().toISOString());
      return { ...state, status: 'completed', completedAt: now() };
    }

    default:
      return state;
  }
}

/** Score derived from answers against the quiz. Never stored. */
export function computeScore(quiz: Quiz, answers: Record<string, string>): number {
  return quiz.questions.reduce(
    (score, question) => (answers[question.id] === question.correctOptionId ? score + 1 : score),
    0,
  );
}

export function isQuizComplete(state: QuizState): boolean {
  return state.questionOrder.every((id) => state.answers[id] !== undefined);
}
