import { ApiError } from '@/services/apiError';

/** Human-readable message for an error surfaced by the data layer. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'not-found':
        return 'We couldn’t find that quiz. It may have been moved or removed.';
      case 'invalid-data':
        return 'The quiz data looks corrupted, so we can’t show it safely.';
      case 'network':
        return 'We couldn’t reach the quiz service. Check your connection and try again.';
      case 'aborted':
        return 'The request was cancelled.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
}
