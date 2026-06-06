import { api } from '@/services/api/apiClient';
import type { ApiProofOfDelivery } from '@/services/api/types';

export interface SubmitProofBody {
  photoBase64?: string;
  recipientName?: string;
  lat?: number;
  lng?: number;
  notes?: string;
}

export const proofApi = {
  submit(deliveryId: string, body: SubmitProofBody) {
    return api.post<ApiProofOfDelivery>(`/deliveries/${deliveryId}/proof`, body);
  },

  get(deliveryId: string) {
    return api.get<ApiProofOfDelivery>(`/deliveries/${deliveryId}/proof`);
  },
};
