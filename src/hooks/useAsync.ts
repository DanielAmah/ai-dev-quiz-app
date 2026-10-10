import { useCallback, useEffect, useRef, useState } from 'react';
import { isAbortError } from '@/services/apiError';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}

/**
 * Runs an abortable async function and tracks idle/loading/success/error.
 * The in-flight request is aborted when the inputs change or the component
 * unmounts, so a slow response can never overwrite newer state (the race
 * that produces flashes of stale data or "setState after unmount").
 *
 * `task` is read through a ref so callers can pass an inline function without
 * forcing a reload; re-runs are driven solely by `deps` and `reload()`.
 */
export function useAsync<T>(task: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);
  const taskRef = useRef(task);

  useEffect(() => {
    taskRef.current = task;
  });

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    // Resetting to loading when the inputs change is the intended behaviour of
    // a fetch hook, not an accidental cascading render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) =>
      prev.status === 'loading' ? prev : { status: 'loading', data: null, error: null },
    );

    taskRef.current(controller.signal).then(
      (data) => {
        if (active) setState({ status: 'success', data, error: null });
      },
      (error: unknown) => {
        if (!active || isAbortError(error) || controller.signal.aborted) return;
        setState({
          status: 'error',
          data: null,
          error: error instanceof Error ? error : new Error('Unknown error'),
        });
      },
    );

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken]);

  return { ...state, reload };
}
