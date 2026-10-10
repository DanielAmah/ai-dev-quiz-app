/**
 * Application state lives here, separated from presentational components:
 *  - history/   attempt history (persisted, cross-tab)
 *  - profile/   local user profile
 *  - quiz/      the quiz state machine, its session binding and persistence
 *
 * Import state from this barrel so components never reach into the internals.
 */
export { HistoryProvider, useHistory } from './history/HistoryContext';
export { ProfileProvider, useProfile } from './profile/ProfileContext';
export { useQuizSession, type StartOptions } from './quiz/useQuizSession';
export {
  quizReducer,
  createInitialState,
  computeScore,
  isQuizComplete,
  type QuizState,
  type QuizAction,
} from './quiz/quizReducer';
export { buildAttempt } from './quiz/buildAttempt';
export { loadSession, saveSession, clearSession } from './quiz/sessionStore';
