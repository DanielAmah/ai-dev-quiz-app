/**
 * Domain types shared across the app. The mock API returns exactly these
 * shapes, and they are validated at runtime in `services/quizValidation.ts`
 * so a malformed data file fails loudly instead of rendering a broken quiz.
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface AnswerOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: AnswerOption[];
  correctOptionId: string;
  explanation: string;
}

/** Lightweight listing entry returned by `GET /quizzes`. */
export interface QuizSummary {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: Difficulty;
  questionCount: number;
  estimatedMinutes: number;
  /** Bumped when questions change, so saved in-progress sessions can be invalidated. */
  version: number;
}

/** Full quiz returned by `GET /quizzes/:id`. */
export interface Quiz extends QuizSummary {
  questions: Question[];
}

export type QuizMode = 'standard' | 'learn';

export interface QuizOptions {
  shuffle: boolean;
  mode: QuizMode;
}
