import { api } from '@/services/api/apiClient';
import type {
  ApiDelivery,
  CreateDeliveryDto,
  DeliveryQueryParams,
  PaginatedResponse,
} from '@/services/api/types';

function buildQuery(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

export const deliveryApi = {
  create(data: CreateDeliveryDto) {
    return api.post<ApiDelivery>('/deliveries', data);
  },

  list(params: DeliveryQueryParams = {}) {
    return api.get<PaginatedResponse<ApiDelivery>>(`/deliveries${buildQuery(params as Record<string, unknown>)}`);
  },

  getActive() {
    return api.get<ApiDelivery[]>('/deliveries/active');
  },

  getRecent() {
    return api.get<ApiDelivery[]>('/deliveries/recent');
  },

  getById(id: string) {
    return api.get<ApiDelivery>(`/deliveries/${id}`);
  },

  track(trackingId: string) {
    return api.get<ApiDelivery>(`/deliveries/track?trackingId=${encodeURIComponent(trackingId)}`);
  },

  cancel(id: string) {
    return api.post<ApiDelivery>(`/deliveries/${id}/cancel`);
  },
};
