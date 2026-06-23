import { useCallback, useState } from 'react';
import { promoApi, type PromoPreview } from '@/features/promo/services/promoApi';

// On-demand promo validation (NOT auto-fetch): a parent checkout input calls
// `validate(code, orderTotal)` when the user taps "Apply".
export function usePromoValidate() {
  const [preview, setPreview] = useState<PromoPreview | null>(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(async (code: string, orderTotal: number) => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Enter a promo code');
      return null;
    }
    try {
      setValidating(true);
      setError(null);
      const result = await promoApi.validate(trimmed, orderTotal);
      setPreview(result);
      return result;
    } catch (err) {
      // The endpoint returns valid:false for bad codes, so a thrown error here is
      // a transport/server problem rather than a rejected code.
      setError(err instanceof Error ? err.message : 'Could not validate promo code');
      setPreview(null);
      return null;
    } finally {
      setValidating(false);
    }
  }, []);

  const clear = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return { preview, validating, error, validate, clear };
}
