import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AttemptRecord } from '@/types';
import HistoryPage from './HistoryPage';

const mockUseHistory = vi.fn();
vi.mock('@/state/history/HistoryContext', () => ({
  useHistory: () => mockUseHistory(),
}));

function makeAttempt(overrides: Partial<AttemptRecord> = {}): AttemptRecord {
  return {
    id: 'a1',
    quizId: 'quiz-1',
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

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/history']}>
      <Routes>
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  mockUseHistory.mockReset();
  vi.restoreAllMocks();
});

describe('HistoryPage', () => {
  it('renders an EmptyState when there are no attempts', () => {
    mockUseHistory.mockReturnValue({ attempts: [], clearHistory: vi.fn() });
    renderPage();

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No attempts yet')).toBeInTheDocument();
  });

  it('renders the summary, chart and attempt list when there are attempts', () => {
    const attempts = [
      makeAttempt({ id: 'a2', percentage: 90, quizTitle: 'Agents 101' }),
      makeAttempt({ id: 'a1', percentage: 70 }),
    ];
    mockUseHistory.mockReturnValue({ attempts, clearHistory: vi.fn() });
    renderPage();

    // Summary stats: total attempts, best, average.
    expect(screen.getByText('Attempts')).toBeInTheDocument();
    expect(screen.getByText('Best score')).toBeInTheDocument();
    // 90% is the best score; it appears in the summary, personal best and the list.
    expect(screen.getAllByText('90%').length).toBeGreaterThan(0);

    // Chart is accessible as an image with a trend label.
    expect(screen.getByRole('img')).toBeInTheDocument();

    // Both attempts are listed and link to their result.
    expect(screen.getAllByText('Agents 101').length).toBeGreaterThan(0);
    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/results/a2')).toBe(true);
  });

  it('confirms before clearing history', async () => {
    const clearHistory = vi.fn();
    mockUseHistory.mockReturnValue({ attempts: [makeAttempt()], clearHistory });
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderPage();

    await userEvent.click(screen.getByRole('button', { name: 'Clear history' }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(clearHistory).toHaveBeenCalledTimes(1);
  });
});
