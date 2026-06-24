import { api } from '@/services/api/apiClient';

// ── Types (mirror FavoriteResponseDto / CreateFavoriteDto / OrderFavoriteDto) ──

export interface Favorite {
  id: string;
  userId: string;
  label: string;

  fromAddress: string;
  toAddress: string;
  fromLat: number | null;
  fromLng: number | null;
  toLat: number | null;
  toLng: number | null;

  receiver: string;
  packages: string;
  packageSize: string;
  packageWeight: number;
  packageTypes: string[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateFavoriteInput {
  label: string;
  // The past delivery to snapshot as a reusable template.
  deliveryId: string;
}

// Optional pickup override when ordering from a favorite; omitted → immediate.
export interface OrderFavoriteInput {
  pickupDate?: string;
  pickupTime?: string;
}

// The delivery created by POST /favorites/:id/order. Includes the one-time
// plaintext handoff code returned exactly once on create.
export interface CreatedDelivery {
  id: string;
  trackingId: string;
  userId: string;
  status: string;
  fromAddress: string;
  toAddress: string;
  receiver: string;
  packages: string;
  packageSize: string;
  packageWeight: number;
  packageTypes: string[];
  pickupDate: string;
  pickupTime: string;
  estimatedPrice: number;
  handoffCode: string;
  createdAt: string;
  updatedAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const favoriteApi = {
  list() {
    return api.get<Favorite[]>('/favorites');
  },

  create(data: CreateFavoriteInput) {
    return api.post<Favorite>('/favorites', data);
  },

  remove(id: string) {
    return api.delete<void>(`/favorites/${id}`);
  },

  orderFromFavorite(id: string, body?: OrderFavoriteInput) {
    return api.post<CreatedDelivery>(`/favorites/${id}/order`, body);
  },
};
