import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

/**
 * Loads a GET endpoint and tracks the three states every screen needs to
 * handle: loading, failed, and loaded-but-empty. `reload` re-runs it after a
 * mutation so screens never render a stale copy of what they just changed.
 */
export function useApi(path, { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);

  const load = useCallback(
    async (signal) => {
      if (skip) return;
      setLoading(true);
      try {
        const result = await api.get(path, { signal });
        setData(result);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [path, skip],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { data, error, loading, reload: () => load(), setData };
}
