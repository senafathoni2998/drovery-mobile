import { useCallback, useEffect, useState } from 'react';
import { favoriteApi, type Favorite } from '@/features/favorites/services/favoriteApi';

export function useFavorites() {
  const [data, setData] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await favoriteApi.list();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const remove = useCallback(async (id: string) => {
    // Optimistic remove; restore on failure so the row reappears.
    const previous = data;
    setData((prev) => prev.filter((f) => f.id !== id));
    try {
      await favoriteApi.remove(id);
    } catch (err) {
      setData(previous);
      throw err;
    }
  }, [data]);

  return { data, loading, error, refetch: fetch, remove };
}
