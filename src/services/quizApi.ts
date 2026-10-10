import type { Quiz, QuizSummary } from '@/types';
import { ApiError } from './apiError';
import { getMockLatency, shouldFail, shouldReturnEmpty } from './mockConfig';
import { isQuiz, isQuizSummaryList } from './quizValidation';

/**
 * Mock quiz API. Data lives as static JSON in `public/mock-api/quizzes`, so
 * requests go through real `fetch` with real async and real failure modes.
 * Swapping in a backend means changing `API_BASE` and nothing else.
 *
 * Adding a quiz: drop `<id>.json` in that folder and add its summary to
 * `index.json`. The data test suite validates every file.
 */
const API_BASE = `${import.meta.env.BASE_URL}mock-api`;

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ApiError('aborted', 'Request was cancelled'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new ApiError('aborted', 'Request was cancelled'));
      },
      { once: true },
    );
  });
}

async function getJson(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (signal?.aborted) throw new ApiError('aborted', 'Request was cancelled');
    throw new ApiError('network', error instanceof Error ? error.message : 'Network error');
  }
  if (response.status === 404) throw new ApiError('not-found', 'Not found');
  if (!response.ok) throw new ApiError('network', `Request failed with status ${response.status}`);
  try {
    return await response.json();
  } catch {
    // Vite's dev server answers unknown paths with index.html, so a missing
    // quiz file shows up here as unparseable JSON rather than a 404.
    throw new ApiError('not-found', 'Not found');
  }
}

export async function fetchQuizzes(signal?: AbortSignal): Promise<QuizSummary[]> {
  await wait(getMockLatency(), signal);
  if (shouldFail('catalog')) throw new ApiError('network', 'Simulated catalog failure');
  if (shouldReturnEmpty()) return [];

  const data = await getJson('/quizzes/index.json', signal);
  if (!isQuizSummaryList(data)) throw new ApiError('invalid-data', 'Quiz catalog is malformed');
  return data;
}

const SAFE_ID = /^[a-z0-9-]+$/;

export async function fetchQuiz(quizId: string, signal?: AbortSignal): Promise<Quiz> {
  if (!SAFE_ID.test(quizId)) throw new ApiError('not-found', `Quiz "${quizId}" not found`);
  await wait(getMockLatency(), signal);
  if (shouldFail('quiz')) throw new ApiError('network', 'Simulated quiz failure');

  const data = await getJson(`/quizzes/${quizId}.json`, signal);
  if (!isQuiz(data)) throw new ApiError('invalid-data', `Quiz "${quizId}" is malformed`);
  return data;
}
