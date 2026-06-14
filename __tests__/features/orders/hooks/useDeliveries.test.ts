import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDeliveries } from '@/features/orders/hooks/useDeliveries';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import type { ApiDelivery, PaginatedResponse } from '@/services/api/types';

// ── Mock deliveryApi ──────────────────────────────────────────────────────────
jest.mock('@/features/delivery/services/deliveryApi');

const mockedDeliveryApi = deliveryApi as jest.Mocked<typeof deliveryApi>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeMockDelivery = (overrides: Partial<ApiDelivery> = {}): ApiDelivery => ({
  id: 'del-1',
  trackingId: 'TRK-001',
  userId: 'usr-1',
  status: 'PENDING',
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
  ...overrides,
});

const makePaginatedResponse = (
  items: ApiDelivery[],
  overrides: Partial<PaginatedResponse<ApiDelivery>> = {},
): PaginatedResponse<ApiDelivery> => ({
  items,
  total: items.length,
  page: 1,
  limit: 20,
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useDeliveries', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls deliveryApi.list(params) on mount with provided params', async () => {
    const params = { status: 'current' as const, page: 1 };
    const response = makePaginatedResponse([makeMockDelivery()]);
    mockedDeliveryApi.list.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useDeliveries(params));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedDeliveryApi.list).toHaveBeenCalledWith(params);
    expect(result.current.items).toEqual(response.items);
  });

  it('returns items, total, page, limit along with loading, error, refetch', async () => {
    const response = makePaginatedResponse([makeMockDelivery()], { total: 50, page: 2, limit: 10 });
    mockedDeliveryApi.list.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useDeliveries({ page: 2, limit: 10 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toEqual(response.items);
    expect(result.current.total).toBe(50);
    expect(result.current.page).toBe(2);
    expect(result.current.limit).toBe(10);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('has correct defaults: items=[], total=0, page=1, limit=20', () => {
    mockedDeliveryApi.list.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useDeliveries({}));

    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(20);
  });

  it('re-fetches when params change (status)', async () => {
    const response1 = makePaginatedResponse([makeMockDelivery()]);
    const response2 = makePaginatedResponse([makeMockDelivery(), makeMockDelivery({ id: 'del-2' })], { total: 2 });

    mockedDeliveryApi.list
      .mockResolvedValueOnce(response1)
      .mockResolvedValueOnce(response2);

    const { result, rerender } = renderHook(
      ({ params }) => useDeliveries(params),
      { initialProps: { params: { status: 'current' as const } } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.items).toHaveLength(1);

    rerender({ params: { status: 'completed' as const } });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(2);
    });

    expect(mockedDeliveryApi.list).toHaveBeenCalledTimes(2);
  });

  it('sets error on API failure and previous data remains', async () => {
    mockedDeliveryApi.list.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useDeliveries({}));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Server error');
    // default data is preserved
    expect(result.current.items).toEqual([]);
    expect(result.current.total).toBe(0);
  });
});
