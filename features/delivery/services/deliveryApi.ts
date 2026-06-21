import { api } from '@/services/api/apiClient';
import type {
  ApiCreatedDelivery,
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
    // Response carries the one-time plaintext handoffCode (see ApiCreatedDelivery).
    return api.post<ApiCreatedDelivery>('/deliveries', data);
  },

  // Finalize a delivery awaiting handoff by submitting the recipient's 6-digit
  // code → DELIVERED. noAuthRetry: a 401 here means "wrong code", NOT an expired
  // session, so it must throw (not refresh+logout the user out of the app).
  confirmHandoff(id: string, code: string) {
    return api.post<ApiDelivery>(
      `/deliveries/${id}/confirm-handoff`,
      { code },
      { noAuthRetry: true },
    );
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
