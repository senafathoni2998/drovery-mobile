import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/services/api/apiClient';
import {
  ratingApi,
  type DeliveryRating,
  type RateDeliveryBody,
} from '@/features/delivery/services/ratingApi';

/**
 * Loads the caller's existing rating for a delivery (if any) and exposes a
 * submit() that upserts it. A 404 from GET means "not rated yet" — a normal
 * state, not an error — so it leaves `rating` null without surfacing an error.
 */
export function useRating(deliveryId: string | undefined) {
  const [rating, setRating] = useState<DeliveryRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!deliveryId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const result = await ratingApi.get(deliveryId);
      setRating(result);
    } catch (err) {
      // Not rated yet is the expected empty state, not a failure.
      if (err instanceof ApiError && err.status === 404) {
        setRating(null);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load rating');
      }
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const submit = useCallback(
    async (body: RateDeliveryBody) => {
      if (!deliveryId) return;
      try {
        setSubmitting(true);
        setError(null);
        const result = await ratingApi.rate(deliveryId, body);
        setRating(result);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit rating');
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [deliveryId],
  );

  return { rating, loading, submitting, error, submit, refetch: fetch };
}
