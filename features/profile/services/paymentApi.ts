import { api } from '@/services/api/apiClient';
import type { ApiPaymentMethod } from '@/services/api/types';

export interface SetupIntentSession {
  setupIntentClientSecret: string;
  ephemeralKeySecret: string | null;
  customerId: string;
  publishableKey: string | null;
  mock: boolean;
}

export const paymentApi = {
  list() {
    return api.get<ApiPaymentMethod[]>('/payment-methods');
  },

  // Native card entry: creates a Stripe SetupIntent session for the PaymentSheet.
  setupIntent() {
    return api.post<SetupIntentSession>('/payment-methods/setup-intent');
  },

  // Reconcile locally-stored cards with Stripe after the PaymentSheet succeeds.
  sync() {
    return api.post<ApiPaymentMethod[]>('/payment-methods/sync');
  },

  add(data: { network: string; last4: string; holderName: string; expiry: string }) {
    return api.post<ApiPaymentMethod>('/payment-methods', data);
  },

  remove(id: string) {
    return api.delete<{ success: boolean }>(`/payment-methods/${id}`);
  },

  setDefault(id: string) {
    return api.patch<ApiPaymentMethod>(`/payment-methods/${id}/default`);
  },
};
