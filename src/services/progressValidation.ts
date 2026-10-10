import type { AnsweredQuestion, AttemptRecord, Profile } from '@/types';

/** Runtime guards for data read back from localStorage. */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

function isAnsweredQuestion(v: unknown): v is AnsweredQuestion {
  return (
    isRecord(v) &&
    isStr(v.questionId) &&
    isStr(v.prompt) &&
    isStr(v.selectedOptionId) &&
    isStr(v.selectedText) &&
    isStr(v.correctOptionId) &&
    isStr(v.correctText) &&
    isStr(v.explanation) &&
    isBool(v.isCorrect)
  );
}

export function isAttemptRecord(v: unknown): v is AttemptRecord {
  return (
    isRecord(v) &&
    isStr(v.id) &&
    isStr(v.quizId) &&
    isStr(v.quizTitle) &&
    isStr(v.category) &&
    (v.mode === 'standard' || v.mode === 'learn') &&
    isNum(v.score) &&
    isNum(v.total) &&
    isNum(v.percentage) &&
    isStr(v.startedAt) &&
    isStr(v.completedAt) &&
    Array.isArray(v.answers) &&
    v.answers.every(isAnsweredQuestion)
  );
}

export function isAttemptList(v: unknown): v is AttemptRecord[] {
  return Array.isArray(v) && v.every(isAttemptRecord);
}

export function isProfile(v: unknown): v is Profile {
  return isRecord(v) && isStr(v.username);
}
