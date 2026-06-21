import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePaymentMethods } from '@/features/profile/hooks/usePaymentMethods';
import { paymentApi } from '@/features/profile/services/paymentApi';
import type { ApiPaymentMethod } from '@/services/api/types';

// ── Mock paymentApi ───────────────────────────────────────────────────────────
jest.mock('@/features/profile/services/paymentApi');

const mockedPaymentApi = paymentApi as jest.Mocked<typeof paymentApi>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeMockPayment = (overrides: Partial<ApiPaymentMethod> = {}): ApiPaymentMethod => ({
  id: 'pm-1',
  userId: 'usr-1',
  stripePaymentMethodId: 'pm_stripe_1',
  network: 'visa',
  last4: '4242',
  holderName: 'John Doe',
  expiry: '12/26',
  isDefault: true,
  createdAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('usePaymentMethods', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('calls paymentApi.list() on mount and sets data', async () => {
    const methods = [makeMockPayment(), makeMockPayment({ id: 'pm-2', last4: '1234', isDefault: false })];
    mockedPaymentApi.list.mockResolvedValueOnce(methods);

    const { result } = renderHook(() => usePaymentMethods());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockedPaymentApi.list).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(methods);
    expect(result.current.error).toBeNull();
  });

  it('data defaults to empty array', () => {
    mockedPaymentApi.list.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => usePaymentMethods());

    expect(result.current.data).toEqual([]);
  });

  it('remove(id) calls paymentApi.remove(id) and filters item out of local state', async () => {
    const methods = [
      makeMockPayment({ id: 'pm-1', isDefault: true }),
      makeMockPayment({ id: 'pm-2', isDefault: false }),
    ];
    mockedPaymentApi.list.mockResolvedValueOnce(methods);
    mockedPaymentApi.remove.mockResolvedValueOnce(undefined as any);

    const { result } = renderHook(() => usePaymentMethods());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);

    await act(async () => {
      await result.current.remove('pm-1');
    });

    expect(mockedPaymentApi.remove).toHaveBeenCalledWith('pm-1');
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].id).toBe('pm-2');
  });

  it('remove(id) on error propagates the error to the caller', async () => {
    const methods = [makeMockPayment()];
    mockedPaymentApi.list.mockResolvedValueOnce(methods);
    mockedPaymentApi.remove.mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(() => usePaymentMethods());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.remove('pm-1');
      }),
    ).rejects.toThrow('Delete failed');
  });

  it('setDefault(id) calls paymentApi.setDefault(id) and toggles isDefault locally', async () => {
    const methods = [
      makeMockPayment({ id: 'pm-1', isDefault: true }),
      makeMockPayment({ id: 'pm-2', isDefault: false }),
    ];
    mockedPaymentApi.list.mockResolvedValueOnce(methods);
    mockedPaymentApi.setDefault.mockResolvedValueOnce(undefined as any);

    const { result } = renderHook(() => usePaymentMethods());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.setDefault('pm-2');
    });

    expect(mockedPaymentApi.setDefault).toHaveBeenCalledWith('pm-2');
    // pm-1 should no longer be default, pm-2 should be
    expect(result.current.data.find(m => m.id === 'pm-1')?.isDefault).toBe(false);
    expect(result.current.data.find(m => m.id === 'pm-2')?.isDefault).toBe(true);
  });

  it('setDefault(id) on error propagates the error to the caller', async () => {
    const methods = [makeMockPayment()];
    mockedPaymentApi.list.mockResolvedValueOnce(methods);
    mockedPaymentApi.setDefault.mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => usePaymentMethods());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.setDefault('pm-1');
      }),
    ).rejects.toThrow('Update failed');
  });
});
