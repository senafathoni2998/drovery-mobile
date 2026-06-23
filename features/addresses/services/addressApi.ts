import { api } from '@/services/api/apiClient';

// ── Types (mirror SavedAddressResponseDto / Create / Update DTOs) ──────────────

export interface SavedAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecentAddress {
  address: string;
  lat: number | null;
  lng: number | null;
  type: 'from' | 'to';
  usedAt: string;
}

export interface CreateSavedAddressInput {
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface UpdateSavedAddressInput {
  label?: string;
  address?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const addressApi = {
  list() {
    return api.get<SavedAddress[]>('/addresses');
  },

  getRecent() {
    return api.get<RecentAddress[]>('/addresses/recent');
  },

  create(data: CreateSavedAddressInput) {
    return api.post<SavedAddress>('/addresses', data);
  },

  get(id: string) {
    return api.get<SavedAddress>(`/addresses/${id}`);
  },

  update(id: string, data: UpdateSavedAddressInput) {
    return api.patch<SavedAddress>(`/addresses/${id}`, data);
  },

  setDefault(id: string) {
    return api.post<SavedAddress>(`/addresses/${id}/default`);
  },

  remove(id: string) {
    return api.delete<{ success: boolean }>(`/addresses/${id}`);
  },
};
