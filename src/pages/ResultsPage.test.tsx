import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AttemptRecord } from '@/types';
import ResultsPage from './ResultsPage';

const mockUseHistory = vi.fn();
vi.mock('@/context/HistoryContext', () => ({
  useHistory: () => mockUseHistory(),
}));

const attempt: AttemptRecord = {
  id: 'attempt-1',
  quizId: 'quiz-1',
  quizTitle: 'Prompting Basics',
  category: 'Prompting',
  mode: 'standard',
  score: 1,
  total: 2,
  percentage: 50,
  startedAt: '2026-01-01T10:00:00.000Z',
  completedAt: '2026-01-01T10:05:00.000Z',
  answers: [
    {
      questionId: 'q1',
      prompt: 'What is a token?',
      selectedOptionId: 'b',
      selectedText: 'A password',
      correctOptionId: 'a',
      correctText: 'A unit of text',
      explanation: 'Tokens are chunks of text.',
      isCorrect: false,
    },
    {
      questionId: 'q2',
      prompt: 'What is a prompt?',
      selectedOptionId: 'a',
      selectedText: 'An instruction',
      correctOptionId: 'a',
      correctText: 'An instruction',
      explanation: 'A prompt is the input.',
      isCorrect: true,
    },
  ],
};

function renderAt(attemptId: string) {
  return render(
    <MemoryRouter initialEntries={[`/results/${attemptId}`]}>
      <Routes>
        <Route path="/results/:attemptId" element={<ResultsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  mockUseHistory.mockReset();
});

describe('ResultsPage', () => {
  it('renders score, percentage and only the missed question', () => {
    mockUseHistory.mockReturnValue({ attempts: [attempt] });
    renderAt('attempt-1');

    expect(screen.getByText('Prompting Basics')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    // Missed question is shown with the user's and correct answers.
    expect(screen.getByText('What is a token?')).toBeInTheDocument();
    expect(screen.getByText('A password')).toBeInTheDocument();
    expect(screen.getByText('A unit of text')).toBeInTheDocument();
    // The correctly answered question is not part of the review.
    expect(screen.queryByText('What is a prompt?')).not.toBeInTheDocument();
  });

  it('shows an all-correct note when nothing was missed', () => {
    const perfect: AttemptRecord = {
      ...attempt,
      score: 2,
      percentage: 100,
      answers: attempt.answers.map((a) => ({ ...a, isCorrect: true })),
    };
    mockUseHistory.mockReturnValue({ attempts: [perfect] });
    renderAt('attempt-1');

    expect(screen.getByTestId('all-correct')).toBeInTheDocument();
  });

  it('renders an EmptyState when the attempt is not found', () => {
    mockUseHistory.mockReturnValue({ attempts: [attempt] });
    renderAt('missing');

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('Result not found')).toBeInTheDocument();
  });
});
