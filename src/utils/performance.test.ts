import { describe, expect, it } from 'vitest';
import type { AttemptRecord } from '@/types';
import { getPerformance, perQuizBests, summariseHistory } from './performance';

function makeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: 'a1',
    quizId: 'q1',
    quizTitle: 'Prompting Basics',
    category: 'Prompting',
    mode: 'standard',
    score: 8,
    total: 10,
    percentage: 80,
    startedAt: '2026-01-01T10:00:00.000Z',
    completedAt: '2026-01-01T10:05:00.000Z',
    answers: [],
    ...overrides,
  };
}

describe('getPerformance', () => {
  it('returns outstanding at and above 90', () => {
    expect(getPerformance(100).band).toBe('outstanding');
    expect(getPerformance(90).band).toBe('outstanding');
    expect(getPerformance(90).title).toBe('Outstanding');
  });

  it('returns great from 70 up to but not including 90', () => {
    expect(getPerformance(89).band).toBe('great');
    expect(getPerformance(70).band).toBe('great');
    expect(getPerformance(70).title).toBe('Great work');
  });

  it('returns good from 50 up to but not including 70', () => {
    expect(getPerformance(69).band).toBe('good');
    expect(getPerformance(50).band).toBe('good');
    expect(getPerformance(50).title).toBe('Good effort');
  });

  it('returns keep practising below 50', () => {
    expect(getPerformance(49).band).toBe('practising');
    expect(getPerformance(0).band).toBe('practising');
    expect(getPerformance(0).title).toBe('Keep practising');
  });
});

describe('summariseHistory', () => {
  it('returns zeroes for an empty list', () => {
    expect(summariseHistory([])).toEqual({
      totalAttempts: 0,
      bestPercentage: 0,
      averagePercentage: 0,
    });
  });

  it('computes total, best and rounded average', () => {
    const attempts = [
      makeAttempt({ id: 'a1', percentage: 90 }),
      makeAttempt({ id: 'a2', percentage: 60 }),
      makeAttempt({ id: 'a3', percentage: 71 }),
    ];
    const summary = summariseHistory(attempts);
    expect(summary.totalAttempts).toBe(3);
    expect(summary.bestPercentage).toBe(90);
    expect(summary.averagePercentage).toBe(74); // (90+60+71)/3 = 73.67 -> 74
  });
});

describe('perQuizBests', () => {
  it('groups by quiz, keeps best percentage and counts attempts', () => {
    const attempts = [
      makeAttempt({ id: 'a1', quizId: 'q1', quizTitle: 'Alpha', percentage: 50 }),
      makeAttempt({ id: 'a2', quizId: 'q1', quizTitle: 'Alpha', percentage: 80 }),
      makeAttempt({ id: 'a3', quizId: 'q2', quizTitle: 'Beta', percentage: 95 }),
    ];
    const bests = perQuizBests(attempts);
    expect(bests).toHaveLength(2);
    expect(bests[0]).toMatchObject({ quizId: 'q2', bestPercentage: 95, attemptCount: 1 });
    expect(bests[1]).toMatchObject({ quizId: 'q1', bestPercentage: 80, attemptCount: 2 });
  });
});
