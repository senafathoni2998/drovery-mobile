import { api } from '@/services/api/apiClient';
import type { EstimatePriceDto, PriceEstimate } from '@/services/api/types';

export const pricingApi = {
  estimate(data: EstimatePriceDto) {
    return api.post<PriceEstimate>('/pricing/estimate', data, { skipAuth: true });
  },
};
