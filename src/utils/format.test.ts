import { describe, expect, it } from 'vitest';
import { formatPercent, formatScore, formatScoreLine, pluralizeAttempts } from './format';

describe('format helpers', () => {
  it('rounds percentages', () => {
    expect(formatPercent(82.6)).toBe('83%');
    expect(formatPercent(80)).toBe('80%');
  });

  it('formats score and score line', () => {
    expect(formatScore(4, 5)).toBe('4 / 5');
    expect(formatScoreLine(4, 5, 80)).toBe('4 / 5 · 80%');
  });

  it('pluralizes attempts', () => {
    expect(pluralizeAttempts(1)).toBe('1 attempt');
    expect(pluralizeAttempts(3)).toBe('3 attempts');
  });
});
