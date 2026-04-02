import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useActiveDeliveries } from '@/features/home/hooks/useActiveDeliveries';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import type { ApiDelivery } from '@/services/api/types';

// ── Mock deliveryApi ──────────────────────────────────────────────────────────
jest.mock('@/features/delivery/services/deliveryApi');

const mockedDeliveryApi = deliveryApi as jest.Mocked<typeof deliveryApi>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeMockDelivery = (overrides: Partial<ApiDelivery> = {}): ApiDelivery => ({
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
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useActiveDeliveries', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls deliveryApi.getActive() on mount and sets data', async () => {
    const mockList = [makeMockDelivery(), makeMockDelivery({ id: 'del-2', trackingId: 'TRK-002' })];
    mockedDeliveryApi.getActive.mockResolvedValueOnce(mockList);

    const { result } = renderHook(() => useActiveDeliveries());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedDeliveryApi.getActive).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockList);
    expect(result.current.error).toBeNull();
  });

  it('data defaults to empty array', () => {
    // Don't resolve the mock so we can inspect the initial state
    mockedDeliveryApi.getActive.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useActiveDeliveries());

    expect(result.current.data).toEqual([]);
  });

  it('sets error on API failure and data stays at previous value', async () => {
    mockedDeliveryApi.getActive.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useActiveDeliveries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    // data stays at the default empty array (not overwritten on error)
    expect(result.current.data).toEqual([]);
  });

  it('refetch re-calls the fetch function', async () => {
    const firstBatch = [makeMockDelivery()];
    const secondBatch = [makeMockDelivery(), makeMockDelivery({ id: 'del-2' })];

    mockedDeliveryApi.getActive
      .mockResolvedValueOnce(firstBatch)
      .mockResolvedValueOnce(secondBatch);

    const { result } = renderHook(() => useActiveDeliveries());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(2);
    });

    expect(mockedDeliveryApi.getActive).toHaveBeenCalledTimes(2);
  });
});
