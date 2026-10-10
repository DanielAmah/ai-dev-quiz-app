import { StrictMode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuizSummary } from '@/types';
import { ApiError } from '@/services/apiError';
import HomePage from './HomePage';
import { ProfileProvider } from '@/context/ProfileContext';

vi.mock('@/services/quizApi', () => ({
  fetchQuizzes: vi.fn(),
}));

import { fetchQuizzes } from '@/services/quizApi';

const mockFetchQuizzes = vi.mocked(fetchQuizzes);

const quizzes: QuizSummary[] = [
  {
    id: 'agent-fundamentals',
    title: 'Agent Fundamentals',
    category: 'Agent Design',
    description: 'What makes a system an agent: the loop, tools and memory.',
    difficulty: 'beginner',
    questionCount: 6,
    estimatedMinutes: 4,
    version: 1,
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering Essentials',
    category: 'Prompt Engineering',
    description: 'Clear instructions, examples and output formats models follow.',
    difficulty: 'beginner',
    questionCount: 6,
    estimatedMinutes: 4,
    version: 1,
  },
];

function renderHome() {
  return render(
    <StrictMode>
      <ProfileProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </ProfileProvider>
    </StrictMode>,
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    mockFetchQuizzes.mockReset();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('shows the loading state then renders the quiz list', async () => {
    mockFetchQuizzes.mockResolvedValue(quizzes);
    renderHome();

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();

    expect(await screen.findByText('Agent Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Prompt Engineering Essentials')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AI Development Quizzes');
  });

  it('shows an error state with a retry action when fetching fails', async () => {
    mockFetchQuizzes.mockRejectedValue(new ApiError('network', 'boom'));
    renderHome();

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(within(alert).getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows an empty state when the catalog is empty', async () => {
    mockFetchQuizzes.mockResolvedValue([]);
    renderHome();

    expect(await screen.findByText('No quizzes yet')).toBeInTheDocument();
  });

  it('filters the list by search term', async () => {
    mockFetchQuizzes.mockResolvedValue(quizzes);
    const user = userEvent.setup();
    renderHome();

    await screen.findByText('Agent Fundamentals');

    const searchBox = screen.getByRole('searchbox', { name: /search quizzes/i });
    await user.type(searchBox, 'prompt');

    await waitFor(() => {
      expect(screen.queryByText('Agent Fundamentals')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Prompt Engineering Essentials')).toBeInTheDocument();
  });

  it('shows a no-match empty state with a clear-filters action', async () => {
    mockFetchQuizzes.mockResolvedValue(quizzes);
    const user = userEvent.setup();
    renderHome();

    await screen.findByText('Agent Fundamentals');

    const searchBox = screen.getByRole('searchbox', { name: /search quizzes/i });
    await user.type(searchBox, 'zzz-nothing');

    expect(await screen.findByText('No quizzes match')).toBeInTheDocument();
    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    await user.click(clearButton);

    expect(await screen.findByText('Agent Fundamentals')).toBeInTheDocument();
  });
});
