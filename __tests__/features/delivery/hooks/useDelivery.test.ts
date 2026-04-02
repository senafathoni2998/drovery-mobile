import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDelivery } from '@/features/delivery/hooks/useDelivery';
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
  status: 'PENDING',
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

describe('useDelivery', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches delivery data when a valid id is provided', async () => {
    mockedDeliveryApi.getById.mockResolvedValueOnce(MOCK_DELIVERY);

    const { result } = renderHook(() => useDelivery('del-1'));

    // initially loading
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedDeliveryApi.getById).toHaveBeenCalledWith('del-1');
    expect(result.current.data).toEqual(MOCK_DELIVERY);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch and sets loading to false when id is undefined', async () => {
    const { result } = renderHook(() => useDelivery(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedDeliveryApi.getById).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets error message from Error instance on API failure', async () => {
    mockedDeliveryApi.getById.mockRejectedValueOnce(new Error('Network failure'));

    const { result } = renderHook(() => useDelivery('del-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network failure');
    expect(result.current.data).toBeNull();
  });

  it('sets fallback error message on non-Error throw', async () => {
    mockedDeliveryApi.getById.mockRejectedValueOnce('some string error');

    const { result } = renderHook(() => useDelivery('del-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load delivery');
    expect(result.current.data).toBeNull();
  });

  it('refetch re-calls the fetch function', async () => {
    mockedDeliveryApi.getById
      .mockResolvedValueOnce(MOCK_DELIVERY)
      .mockResolvedValueOnce({ ...MOCK_DELIVERY, status: 'DELIVERED' });

    const { result } = renderHook(() => useDelivery('del-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.status).toBe('PENDING');

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data?.status).toBe('DELIVERED');
    });

    expect(mockedDeliveryApi.getById).toHaveBeenCalledTimes(2);
  });

  it('re-fetches when id changes', async () => {
    const secondDelivery: ApiDelivery = { ...MOCK_DELIVERY, id: 'del-2', trackingId: 'TRK-002' };

    mockedDeliveryApi.getById
      .mockResolvedValueOnce(MOCK_DELIVERY)
      .mockResolvedValueOnce(secondDelivery);

    const { result, rerender } = renderHook(
      ({ id }: { id: string | undefined }) => useDelivery(id),
      { initialProps: { id: 'del-1' as string | undefined } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.id).toBe('del-1');

    rerender({ id: 'del-2' });

    await waitFor(() => {
      expect(result.current.data?.id).toBe('del-2');
    });

    expect(mockedDeliveryApi.getById).toHaveBeenCalledTimes(2);
    expect(mockedDeliveryApi.getById).toHaveBeenLastCalledWith('del-2');
  });
});
