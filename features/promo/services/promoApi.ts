import { api } from '@/services/api/apiClient';

// Mirrors the backend PromoValidateResponseDto (flattened discriminated union).
// The `valid` flag tells you which fields will be present:
//  - valid: true  -> code, discountType, discountAmount, originalTotal, finalTotal
//  - valid: false -> reason, message
export type PromoDiscountType = 'PERCENT' | 'FIXED';

export type PromoRejectReason =
  | 'INVALID'
  | 'INACTIVE'
  | 'NOT_STARTED'
  | 'EXPIRED'
  | 'GLOBALLY_MAXED'
  | 'PER_USER_EXCEEDED'
  | 'MIN_NOT_MET';

export interface PromoPreview {
  valid: boolean;

  // Present when valid = true
  code?: string | null;
  discountType?: PromoDiscountType | null;
  discountAmount?: number | null;
  originalTotal?: number | null;
  finalTotal?: number | null;

  // Present when valid = false
  reason?: PromoRejectReason | null;
  message?: string | null;
}

export const promoApi = {
  // Advisory preview — the backend never throws on an invalid code, it returns
  // { valid: false, reason, message } instead.
  validate(code: string, orderTotal: number) {
    return api.post<PromoPreview>('/promo/validate', { code, orderTotal });
  },
};
