export type ApiErrorKind = 'network' | 'not-found' | 'invalid-data' | 'aborted';

/** A typed error so the UI can show a specific, helpful message per failure kind. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof ApiError && error.kind === 'aborted') ||
    (error instanceof DOMException && error.name === 'AbortError')
  );
}
