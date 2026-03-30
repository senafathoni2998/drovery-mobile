import { api } from '@/services/api/apiClient';
import type { ApiPaymentMethod } from '@/services/api/types';

export const paymentApi = {
  list() {
    return api.get<ApiPaymentMethod[]>('/payment-methods');
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
