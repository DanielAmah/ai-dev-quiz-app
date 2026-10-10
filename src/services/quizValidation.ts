import type { AnswerOption, Difficulty, Question, Quiz, QuizSummary } from '@/types';

/**
 * Hand-written runtime guards for data coming from the (mock) API.
 * TypeScript types disappear at runtime, so anything crossing a network or
 * storage boundary is checked before the UI trusts it.
 */

const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'intermediate', 'advanced'];

export const MIN_QUESTIONS_PER_QUIZ = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isAnswerOption(value: unknown): value is AnswerOption {
  return isRecord(value) && isNonEmptyString(value.id) && isNonEmptyString(value.text);
}

export function isQuestion(value: unknown): value is Question {
  if (!isRecord(value)) return false;
  const { id, prompt, options, correctOptionId, explanation } = value;
  if (!isNonEmptyString(id) || !isNonEmptyString(prompt) || !isNonEmptyString(explanation)) {
    return false;
  }
  if (!Array.isArray(options) || options.length < 2 || !options.every(isAnswerOption)) {
    return false;
  }
  const optionIds = new Set(options.map((option) => option.id));
  if (optionIds.size !== options.length) return false;
  return isNonEmptyString(correctOptionId) && optionIds.has(correctOptionId);
}

export function isQuizSummary(value: unknown): value is QuizSummary {
  if (!isRecord(value)) return false;
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.category) &&
    isNonEmptyString(value.description) &&
    DIFFICULTIES.includes(value.difficulty as Difficulty) &&
    isPositiveInteger(value.questionCount) &&
    isPositiveInteger(value.estimatedMinutes) &&
    isPositiveInteger(value.version)
  );
}

export function isQuizSummaryList(value: unknown): value is QuizSummary[] {
  return Array.isArray(value) && value.every(isQuizSummary);
}

export function isQuiz(value: unknown): value is Quiz {
  if (!isQuizSummary(value)) return false;
  const { questions } = value as unknown as Record<string, unknown>;
  if (!Array.isArray(questions) || questions.length < MIN_QUESTIONS_PER_QUIZ) return false;
  if (!questions.every(isQuestion)) return false;
  const questionIds = new Set(questions.map((question) => question.id));
  return questionIds.size === questions.length && value.questionCount === questions.length;
}
