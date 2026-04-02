import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTrackDelivery } from '@/features/delivery/hooks/useTrackDelivery';
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
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useTrackDelivery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('loading starts at false (imperative hook, not auto-fetch)', () => {
    const { result } = renderHook(() => useTrackDelivery());

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockedDeliveryApi.track).not.toHaveBeenCalled();
  });

  it('track(trackingId) calls deliveryApi.track, sets data, and returns result', async () => {
    mockedDeliveryApi.track.mockResolvedValueOnce(MOCK_DELIVERY);

    const { result } = renderHook(() => useTrackDelivery());

    let returnValue: ApiDelivery | null = null;

    await act(async () => {
      returnValue = await result.current.track('TRK-001');
    });

    expect(mockedDeliveryApi.track).toHaveBeenCalledWith('TRK-001');
    expect(result.current.data).toEqual(MOCK_DELIVERY);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(returnValue).toEqual(MOCK_DELIVERY);
  });

  it('track() on error sets error, sets data to null, and returns null', async () => {
    mockedDeliveryApi.track.mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useTrackDelivery());

    let returnValue: ApiDelivery | null = MOCK_DELIVERY; // start non-null to verify it becomes null

    await act(async () => {
      returnValue = await result.current.track('TRK-INVALID');
    });

    expect(result.current.error).toBe('Not found');
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(returnValue).toBeNull();
  });

  it('uses fallback error message for non-Error throws', async () => {
    mockedDeliveryApi.track.mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useTrackDelivery());

    await act(async () => {
      await result.current.track('TRK-BAD');
    });

    expect(result.current.error).toBe('Package not found');
    expect(result.current.data).toBeNull();
  });

  it('loading is true during fetch and false after', async () => {
    let resolvePromise: (value: ApiDelivery) => void;
    const pendingPromise = new Promise<ApiDelivery>((resolve) => {
      resolvePromise = resolve;
    });
    mockedDeliveryApi.track.mockReturnValueOnce(pendingPromise);

    const { result } = renderHook(() => useTrackDelivery());

    expect(result.current.loading).toBe(false);

    // Start the track call but don't resolve yet
    let trackPromise: Promise<ApiDelivery | null>;
    act(() => {
      trackPromise = result.current.track('TRK-001');
    });

    // loading should be true while the promise is pending
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    // Resolve the promise
    await act(async () => {
      resolvePromise!(MOCK_DELIVERY);
      await trackPromise!;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(MOCK_DELIVERY);
  });
});
