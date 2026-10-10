/**
 * A safe, versioned wrapper around localStorage.
 *
 * Every value is stored under a namespaced key as an envelope
 * `{ v: <version>, data: <payload> }`. On read, the envelope is parsed, its
 * version checked and the payload validated by a caller-supplied guard.
 * Anything malformed, outdated or unreadable is discarded and treated as
 * absent, so corrupt storage can never crash the app or feed it bad data.
 *
 * All browser access is wrapped in try/catch: localStorage throws in private
 * mode, when disabled, or when the quota is exceeded.
 */

const NAMESPACE = 'ai-dev-quiz';

export type Validator<T> = (value: unknown) => value is T;

interface Envelope {
  v: number;
  data: unknown;
}

function fullKey(key: string): string {
  return `${NAMESPACE}:${key}`;
}

function isEnvelope(value: unknown): value is Envelope {
  return (
    typeof value === 'object' &&
    value !== null &&
    'v' in value &&
    'data' in value &&
    typeof (value as Envelope).v === 'number'
  );
}

export function readValue<T>(key: string, version: number, validate: Validator<T>): T | null {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(fullKey(key));
  } catch {
    return null;
  }
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    removeValue(key);
    return null;
  }

  if (!isEnvelope(parsed) || parsed.v !== version || !validate(parsed.data)) {
    removeValue(key);
    return null;
  }
  return parsed.data;
}

export function writeValue<T>(key: string, version: number, data: T): boolean {
  const envelope: Envelope = { v: version, data };
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(envelope));
    return true;
  } catch {
    // Quota exceeded, private mode or disabled storage. The app keeps working
    // with in-memory state; persistence is best-effort.
    return false;
  }
}

export function removeValue(key: string): void {
  try {
    window.localStorage.removeItem(fullKey(key));
  } catch {
    // Nothing we can do; ignore.
  }
}

/**
 * Subscribe to changes of a key made in *other* tabs (the storage event does
 * not fire in the tab that made the change). Returns an unsubscribe function.
 */
export function subscribeToKey(key: string, onChange: () => void): () => void {
  const target = fullKey(key);
  const handler = (event: StorageEvent) => {
    // key === null means storage was cleared entirely.
    if (event.key === null || event.key === target) onChange();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
