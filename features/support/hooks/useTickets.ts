import { useCallback, useEffect, useState } from 'react';
import { ticketsApi, type Ticket } from '@/features/support/services/ticketsApi';

export function useTickets() {
  const [data, setData] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await ticketsApi.getTickets();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
