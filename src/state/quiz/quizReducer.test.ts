import { describe, expect, it } from 'vitest';
import type { Quiz } from '@/types';
import {
  computeScore,
  createInitialState,
  isQuizComplete,
  quizReducer,
  type QuizState,
} from './quizReducer';

const quiz: Quiz = {
  id: 'demo',
  title: 'Demo',
  category: 'Testing',
  description: 'd',
  difficulty: 'beginner',
  estimatedMinutes: 2,
  version: 3,
  questionCount: 3,
  questions: [
    {
      id: 'q1',
      prompt: 'p1',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctOptionId: 'a',
      explanation: 'e1',
    },
    {
      id: 'q2',
      prompt: 'p2',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctOptionId: 'b',
      explanation: 'e2',
    },
    {
      id: 'q3',
      prompt: 'p3',
      options: [
        { id: 'a', text: 'A' },
        { id: 'b', text: 'B' },
      ],
      correctOptionId: 'a',
      explanation: 'e3',
    },
  ],
};

const init = (): QuizState =>
  createInitialState({
    quiz,
    mode: 'standard',
    shuffleQuestions: false,
    now: () => '2026-01-01T00:00:00Z',
  });

describe('quizReducer', () => {
  it('starts in order, in-progress, with no answers', () => {
    const s = init();
    expect(s.questionOrder).toEqual(['q1', 'q2', 'q3']);
    expect(s.status).toBe('in-progress');
    expect(s.quizVersion).toBe(3);
  });

  it('records an answer once and ignores repeats (no double-count on rapid clicks)', () => {
    let s = init();
    s = quizReducer(s, { type: 'answer', questionId: 'q1', optionId: 'a' });
    // Rapid second and third clicks, including a different option.
    s = quizReducer(s, { type: 'answer', questionId: 'q1', optionId: 'b' });
    s = quizReducer(s, { type: 'answer', questionId: 'q1', optionId: 'a' });
    expect(s.answers).toEqual({ q1: 'a' });
  });

  it('ignores answers for a question that is not current', () => {
    let s = init();
    s = quizReducer(s, { type: 'answer', questionId: 'q2', optionId: 'b' });
    expect(s.answers).toEqual({});
  });

  it('does not advance past an unanswered question', () => {
    let s = init();
    s = quizReducer(s, { type: 'next' });
    expect(s.currentIndex).toBe(0);
  });

  it('advances once per next even when fired rapidly', () => {
    let s = init();
    s = quizReducer(s, { type: 'answer', questionId: 'q1', optionId: 'a' });
    s = quizReducer(s, { type: 'next' });
    // Rapid repeat with q2 still unanswered must not skip q2.
    s = quizReducer(s, { type: 'next' });
    expect(s.currentIndex).toBe(1);
  });

  it('cannot advance past the last question with next', () => {
    let s = init();
    s = quizReducer(s, { type: 'answer', questionId: 'q1', optionId: 'a' });
    s = quizReducer(s, { type: 'next' });
    s = quizReducer(s, { type: 'answer', questionId: 'q2', optionId: 'b' });
    s = quizReducer(s, { type: 'next' });
    s = quizReducer(s, { type: 'answer', questionId: 'q3', optionId: 'a' });
    s = quizReducer(s, { type: 'next' });
    expect(s.currentIndex).toBe(2);
  });

  it('finishes only from the last answered question, idempotently', () => {
    let s = init();
    s = quizReducer(s, { type: 'answer', questionId: 'q1', optionId: 'a' });
    // finish from first question is rejected
    s = quizReducer(s, { type: 'finish' });
    expect(s.status).toBe('in-progress');
    s = quizReducer(s, { type: 'next' });
    s = quizReducer(s, { type: 'answer', questionId: 'q2', optionId: 'b' });
    s = quizReducer(s, { type: 'next' });
    s = quizReducer(s, { type: 'answer', questionId: 'q3', optionId: 'a' });
    s = quizReducer(s, { type: 'finish', now: () => '2026-01-01T00:05:00Z' });
    expect(s.status).toBe('completed');
    expect(s.completedAt).toBe('2026-01-01T00:05:00Z');
    // Further actions are no-ops once completed.
    const after = quizReducer(s, { type: 'answer', questionId: 'q3', optionId: 'b' });
    expect(after).toBe(s);
  });

  it('computes score from answers without storing it', () => {
    const answers = { q1: 'a', q2: 'a', q3: 'a' }; // q2 wrong
    expect(computeScore(quiz, answers)).toBe(2);
  });

  it('shuffles deterministically with a provided rng and keeps the same id set', () => {
    const s = createInitialState({
      quiz,
      mode: 'standard',
      shuffleQuestions: true,
      rng: () => 0.99,
    });
    expect([...s.questionOrder].sort()).toEqual(['q1', 'q2', 'q3']);
  });

  it('reports completion when every question is answered', () => {
    let s = init();
    expect(isQuizComplete(s)).toBe(false);
    s = { ...s, answers: { q1: 'a', q2: 'b', q3: 'a' } };
    expect(isQuizComplete(s)).toBe(true);
  });
});
