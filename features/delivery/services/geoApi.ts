import { api } from '@/services/api/apiClient';

/**
 * Geocoding via the backend's keyed/rate-managed /geo endpoints (single source of truth),
 * instead of calling Nominatim directly from the client.
 *
 * NOTE the double envelope: the controller manually returns `{ data }` AND the global
 * TransformInterceptor wraps that in `{ success, data, timestamp }`. The apiClient strips the
 * outer envelope, so what lands here is still `{ data: <result> }` — hence the inner `.data`.
 */
export const geoApi = {
  // GET /geo/geocode?q= → { data: { lat, lng } | null }
  async geocode(
    query: string,
  ): Promise<{ latitude: number; longitude: number } | null> {
    const res = await api.get<{ data: { lat: number; lng: number } | null }>(
      `/geo/geocode?q=${encodeURIComponent(query)}`,
    );
    const c = res?.data;
    return c ? { latitude: c.lat, longitude: c.lng } : null;
  },

  // GET /geo/reverse?lat=&lng= → { data: string | null }
  async reverse(lat: number, lng: number): Promise<string | null> {
    const res = await api.get<{ data: string | null }>(
      `/geo/reverse?lat=${lat}&lng=${lng}`,
    );
    return res?.data ?? null;
  },
};
