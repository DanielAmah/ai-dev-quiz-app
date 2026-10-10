import {
  createContext,
  use,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import type { AttemptRecord } from '@/types';
import { isAttemptList } from '@/services/progressValidation';
import { readValue, removeValue, subscribeToKey, writeValue } from '@/services/storage';

const KEY = 'history';
const VERSION = 1;
const MAX_ATTEMPTS = 200;

function load(): AttemptRecord[] {
  return readValue(KEY, VERSION, isAttemptList) ?? [];
}

// A cached snapshot keeps useSyncExternalStore stable (same reference until a
// real change), avoiding an infinite render loop.
let snapshot: AttemptRecord[] = load();
const listeners = new Set<() => void>();

function emit() {
  snapshot = load();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const unsubscribeStorage = subscribeToKey(KEY, emit);
  return () => {
    listeners.delete(listener);
    unsubscribeStorage();
  };
}

function persist(next: AttemptRecord[]) {
  snapshot = next;
  writeValue(KEY, VERSION, next);
  listeners.forEach((l) => l());
}

interface HistoryContextValue {
  attempts: AttemptRecord[];
  addAttempt: (attempt: AttemptRecord) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const attempts = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );

  const addAttempt = useCallback((attempt: AttemptRecord) => {
    persist([attempt, ...load()].slice(0, MAX_ATTEMPTS));
  }, []);

  const clearHistory = useCallback(() => {
    removeValue(KEY);
    persist([]);
  }, []);

  const value = useMemo(
    () => ({ attempts, addAttempt, clearHistory }),
    [attempts, addAttempt, clearHistory],
  );
  return <HistoryContext value={value}>{children}</HistoryContext>;
}

export function useHistory(): HistoryContextValue {
  const ctx = use(HistoryContext);
  if (!ctx) throw new Error('useHistory must be used within a HistoryProvider');
  return ctx;
}
