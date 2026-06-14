import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDeliveryTracking } from '@/features/delivery/hooks/useDeliveryTracking';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import type { ApiDelivery } from '@/services/api/types';

// ── Mock deliveryApi ──────────────────────────────────────────────────────────
jest.mock('@/features/delivery/services/deliveryApi');

const mockedDeliveryApi = deliveryApi as jest.Mocked<typeof deliveryApi>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_DELIVERY: ApiDelivery = {
  id: 'del-1',
  trackingId: 'TRK-001',
  userId: 'usr-1',
  status: 'IN_TRANSIT',
  failureReason: null,
  fromAddress: '123 Origin St',
  toAddress: '456 Dest Ave',
  fromLat: -6.2,
  fromLng: 106.8,
  toLat: -6.3,
  toLng: 106.9,
  receiver: 'John Doe',
  packages: 'Box',
  packageSize: 'Medium',
  packageWeight: 2,
  packageTypes: ['fragile'],
  pickupDate: '2024-06-01',
  pickupTime: '10:00 AM',
  estimatedDelivery: '12:00 PM',
  estimatedPrice: 15,
  createdAt: '2024-06-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
  tracking: {
    id: 'trk-1',
    deliveryId: 'del-1',
    droneLat: -6.25,
    droneLng: 106.85,
    droneStatus: 'in_flight',
    routeJson: null,
    eta: '11:45 AM',
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useDeliveryTracking', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches delivery data when a valid id is provided', async () => {
    mockedDeliveryApi.getById.mockResolvedValueOnce(MOCK_DELIVERY);

    const { result } = renderHook(() => useDeliveryTracking('del-1'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedDeliveryApi.getById).toHaveBeenCalledWith('del-1');
    expect(result.current.data).toEqual(MOCK_DELIVERY);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when id is undefined', async () => {
    const { result } = renderHook(() => useDeliveryTracking(undefined));

    // loading stays true since the guard returns early without touching setLoading
    // but data remains null and no API call is made
    expect(mockedDeliveryApi.getById).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('sets error message from Error instance on API failure', async () => {
    mockedDeliveryApi.getById.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useDeliveryTracking('del-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Server error');
    expect(result.current.data).toBeNull();
  });

  it('sets fallback error message on non-Error throw', async () => {
    mockedDeliveryApi.getById.mockRejectedValueOnce('some string error');

    const { result } = renderHook(() => useDeliveryTracking('del-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load tracking');
    expect(result.current.data).toBeNull();
  });

  it('refetch re-calls the fetch function', async () => {
    const updatedDelivery = { ...MOCK_DELIVERY, status: 'DELIVERED' as const };

    mockedDeliveryApi.getById
      .mockResolvedValueOnce(MOCK_DELIVERY)
      .mockResolvedValueOnce(updatedDelivery);

    const { result } = renderHook(() => useDeliveryTracking('del-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.status).toBe('IN_TRANSIT');

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data?.status).toBe('DELIVERED');
    });

    expect(mockedDeliveryApi.getById).toHaveBeenCalledTimes(2);
  });
});
