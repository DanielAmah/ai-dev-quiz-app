import type { AnsweredQuestion, AttemptRecord, Quiz } from '@/types';
import { createId } from '@/utils/id';
import { computeScore, type QuizState } from './quizReducer';

/** Turn a completed quiz state into a self-contained attempt record for history. */
export function buildAttempt(quiz: Quiz, state: QuizState): AttemptRecord {
  const byId = new Map(quiz.questions.map((q) => [q.id, q]));
  const answers: AnsweredQuestion[] = state.questionOrder.map((questionId) => {
    const question = byId.get(questionId)!;
    const selectedOptionId = state.answers[questionId] ?? '';
    const selected = question.options.find((o) => o.id === selectedOptionId);
    const correct = question.options.find((o) => o.id === question.correctOptionId)!;
    return {
      questionId,
      prompt: question.prompt,
      selectedOptionId,
      selectedText: selected?.text ?? 'No answer',
      correctOptionId: question.correctOptionId,
      correctText: correct.text,
      explanation: question.explanation,
      isCorrect: selectedOptionId === question.correctOptionId,
    };
  });
  const score = computeScore(quiz, state.answers);
  const total = quiz.questions.length;
  return {
    id: createId(),
    quizId: quiz.id,
    quizTitle: quiz.title,
    category: quiz.category,
    mode: state.mode,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    startedAt: state.startedAt,
    completedAt: state.completedAt ?? new Date().toISOString(),
    answers,
  };
}
