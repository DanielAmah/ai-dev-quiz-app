import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './apiError';
import { fetchQuiz, fetchQuizzes } from './quizApi';

const summary = {
  id: 'demo',
  title: 'Demo',
  category: 'Testing',
  description: 'A demo quiz',
  difficulty: 'beginner',
  questionCount: 5,
  estimatedMinutes: 2,
  version: 1,
};

const quiz = {
  ...summary,
  questions: Array.from({ length: 5 }, (_, i) => ({
    id: `q${i}`,
    prompt: `Question ${i}`,
    options: [
      { id: 'a', text: 'A' },
      { id: 'b', text: 'B' },
    ],
    correctOptionId: 'a',
    explanation: 'Because.',
  })),
};

function mockFetch(body: unknown, status = 200) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe('quizApi', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/?mockDelay=0');
  });
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/');
  });

  it('returns a validated catalog', async () => {
    mockFetch([summary]);
    await expect(fetchQuizzes()).resolves.toEqual([summary]);
  });

  it('rejects a malformed catalog with an invalid-data error', async () => {
    mockFetch([{ id: 'broken' }]);
    await expect(fetchQuizzes()).rejects.toMatchObject({ kind: 'invalid-data' });
  });

  it('maps a 404 to not-found', async () => {
    mockFetch({}, 404);
    await expect(fetchQuiz('missing')).rejects.toMatchObject({ kind: 'not-found' });
  });

  it('maps a fetch rejection to a network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchQuiz('demo')).rejects.toBeInstanceOf(ApiError);
    await expect(fetchQuiz('demo')).rejects.toMatchObject({ kind: 'network' });
  });

  it('refuses unsafe quiz ids without calling fetch', async () => {
    const spy = mockFetch(quiz);
    await expect(fetchQuiz('../secrets')).rejects.toMatchObject({ kind: 'not-found' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('returns a validated quiz', async () => {
    mockFetch(quiz);
    await expect(fetchQuiz('demo')).resolves.toEqual(quiz);
  });

  it('can simulate failures and an empty catalog via query params', async () => {
    window.history.replaceState(null, '', '/?mockDelay=0&mockError=catalog');
    await expect(fetchQuizzes()).rejects.toMatchObject({ kind: 'network' });
    window.history.replaceState(null, '', '/?mockDelay=0&mockEmpty=1');
    await expect(fetchQuizzes()).resolves.toEqual([]);
  });

  it('rejects with aborted when the signal is cancelled during latency', async () => {
    window.history.replaceState(null, '', '/?mockDelay=1000');
    const controller = new AbortController();
    const promise = fetchQuizzes(controller.signal);
    controller.abort();
    await expect(promise).rejects.toMatchObject({ kind: 'aborted' });
  });
});
