import type { QuizMode } from './quiz';

/**
 * An in-progress (or just-finished) quiz attempt. This is the unit that is
 * persisted to localStorage on every change so a refresh can resume it.
 * Score is never stored here; it is always derived from `answers`, which is
 * what makes double-counting impossible.
 */
export interface QuizSession {
  schemaVersion: 1;
  attemptId: string;
  quizId: string;
  quizVersion: number;
  mode: QuizMode;
  /** Question ids in the order this attempt presents them (supports shuffling). */
  questionOrder: string[];
  currentIndex: number;
  /** questionId -> selected optionId. An entry is written once and never overwritten. */
  answers: Record<string, string>;
  status: 'in-progress' | 'completed';
  startedAt: string;
  completedAt?: string;
}

/** Self-contained snapshot of one answered question, kept for result review. */
export interface AnsweredQuestion {
  questionId: string;
  prompt: string;
  selectedOptionId: string;
  selectedText: string;
  correctOptionId: string;
  correctText: string;
  explanation: string;
  isCorrect: boolean;
}

/** A finished attempt, stored in history. */
export interface AttemptRecord {
  id: string;
  quizId: string;
  quizTitle: string;
  category: string;
  mode: QuizMode;
  score: number;
  total: number;
  percentage: number;
  startedAt: string;
  completedAt: string;
  answers: AnsweredQuestion[];
}

export interface Profile {
  username: string;
}
