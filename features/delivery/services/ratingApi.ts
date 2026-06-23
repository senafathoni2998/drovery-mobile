import { api } from '@/services/api/apiClient';

// Mirrors RateDeliveryDto on the backend (stars 1–5, optional comment ≤ 1000 chars).
export interface RateDeliveryBody {
  stars: number;
  comment?: string;
}

// Mirrors DeliveryRatingDto returned by GET/POST /deliveries/:id/rating.
export interface DeliveryRating {
  id: string;
  deliveryId: string;
  userId: string;
  /** 1–5 stars. */
  stars: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ratingApi = {
  // Upserts the caller's rating for a DELIVERED delivery (revisable).
  rate(deliveryId: string, body: RateDeliveryBody) {
    return api.post<DeliveryRating>(`/deliveries/${deliveryId}/rating`, body);
  },

  // The caller's existing rating. The API answers 404 (ApiError) when not yet
  // rated — callers should treat that as "no rating", not a failure.
  get(deliveryId: string) {
    return api.get<DeliveryRating>(`/deliveries/${deliveryId}/rating`);
  },
};
