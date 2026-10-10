/**
 * Knobs for the mock API so loading, empty and error states can be seen on
 * demand without editing code:
 *
 *   ?mockError=catalog | quiz | all   force a failure
 *   ?mockEmpty=1                      return an empty catalog
 *   ?mockDelay=2000                   override latency in ms
 *
 * Defaults come from VITE_MOCK_LATENCY_MS (see .env.example).
 */

export type MockTarget = 'catalog' | 'quiz';

const DEFAULT_LATENCY_MS = Number(import.meta.env.VITE_MOCK_LATENCY_MS ?? 500);

function params(): URLSearchParams {
  return new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
}

export function getMockLatency(): number {
  const override = Number(params().get('mockDelay'));
  if (Number.isFinite(override) && override >= 0 && params().has('mockDelay')) return override;
  return Number.isFinite(DEFAULT_LATENCY_MS) ? DEFAULT_LATENCY_MS : 0;
}

export function shouldFail(target: MockTarget): boolean {
  const value = params().get('mockError');
  return value === 'all' || value === target;
}

export function shouldReturnEmpty(): boolean {
  return params().get('mockEmpty') === '1';
}
