import { renderHook, act } from '@testing-library/react-native';
import { useDeliveryTracking } from '@/features/delivery/hooks/useDeliveryTracking';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import { openTracking, type TrackingCallbacks } from '@/services/api/trackingSocket';
import { presentLocalNotification } from '@/services/notifications/push';
import { clearHandoffCode } from '@/features/delivery/services/handoffCodeStore';
import type { ApiDelivery, DeliveryStatus } from '@/services/api/types';

jest.mock('@/features/delivery/services/deliveryApi');
jest.mock('@/services/notifications/push', () => ({
  presentLocalNotification: jest.fn(),
  configureNotificationHandler: jest.fn(),
  registerForPushNotifications: jest.fn(),
}));
jest.mock('@/features/delivery/services/handoffCodeStore', () => ({
  clearHandoffCode: jest.fn(),
  getHandoffCode: jest.fn(),
  saveHandoffCode: jest.fn(),
}));
// Controllable socket: capture the callbacks the hook wires up so the test can
// drive onSubscribed/onUpdate/onUnavailable/onAuthFailed by hand. NO real WS.
jest.mock('@/services/api/trackingSocket', () => ({
  openTracking: jest.fn(() => ({ close: jest.fn() })),
}));

const mockedGetById = deliveryApi.getById as jest.Mock;
const mockedOpen = openTracking as jest.Mock;
const mockedPresent = presentLocalNotification as jest.Mock;
const mockedClearHandoff = clearHandoffCode as jest.Mock;

const mk = (status: DeliveryStatus): ApiDelivery =>
  ({
    id: 'del-1',
    trackingId: 'TRK-001',
    userId: 'usr-1',
    status,
    failureReason: null,
    fromAddress: 'A',
    toAddress: 'B',
    fromLat: -6.2,
    fromLng: 106.8,
    toLat: -6.3,
    toLng: 106.9,
    receiver: 'John',
    packages: 'Box',
    packageSize: 'Medium',
    packageWeight: 2,
    packageTypes: [],
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
  }) as ApiDelivery;

// The callbacks passed to the most recent openTracking() call.
const latestCallbacks = (): TrackingCallbacks =>
  mockedOpen.mock.calls[mockedOpen.mock.calls.length - 1][0].callbacks;
const latestClose = (): jest.Mock =>
  mockedOpen.mock.results[mockedOpen.mock.results.length - 1].value.close;

// Flush pending promise microtasks (getById resolutions) under fake timers.
const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockedGetById.mockResolvedValue(mk('IN_TRANSIT'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useDeliveryTracking — WebSocket path', () => {
  it('stops polling once the socket subscribes (no further getById)', async () => {
    const { result } = renderHook(() => useDeliveryTracking('del-1'));
    await flush();
    expect(result.current.data?.status).toBe('IN_TRANSIT');
    expect(mockedGetById).toHaveBeenCalledTimes(1);

    await act(async () => {
      latestCallbacks().onSubscribed();
    });
    await act(async () => {
      jest.advanceTimersByTime(12000);
    });
    await flush();
    expect(mockedGetById).toHaveBeenCalledTimes(1); // socket is authoritative
  });

  it('merges a position-only frame in place with zero HTTP', async () => {
    const { result } = renderHook(() => useDeliveryTracking('del-1'));
    await flush();
    await act(async () => {
      latestCallbacks().onSubscribed();
      latestCallbacks().onUpdate({ deliveryId: 'del-1', droneLat: -6.4, droneLng: 106.95 });
    });
    expect(result.current.data?.tracking?.droneLat).toBe(-6.4);
    expect(result.current.data?.tracking?.eta).toBe('11:45 AM'); // preserved
    expect(result.current.data?.status).toBe('IN_TRANSIT'); // preserved
    expect(mockedGetById).toHaveBeenCalledTimes(1); // no refetch on a position frame
  });

  it('reconciles once on a status change and notifies exactly once', async () => {
    mockedGetById
      .mockResolvedValueOnce(mk('IN_TRANSIT')) // initial
      .mockResolvedValueOnce(mk('AWAITING_HANDOFF')); // reconcile
    const { result } = renderHook(() => useDeliveryTracking('del-1'));
    await flush();

    await act(async () => {
      latestCallbacks().onSubscribed();
      latestCallbacks().onUpdate({ deliveryId: 'del-1', status: 'AWAITING_HANDOFF' });
    });
    await flush();

    expect(result.current.data?.status).toBe('AWAITING_HANDOFF');
    expect(mockedGetById).toHaveBeenCalledTimes(2); // initial + one reconcile
    expect(mockedPresent).toHaveBeenCalledTimes(1); // push notified; reconcile did not re-notify
  });

  it('on a terminal status: closes the socket, clears the code, stops polling', async () => {
    const { result } = renderHook(() => useDeliveryTracking('del-1'));
    await flush();
    const close = latestClose();

    await act(async () => {
      latestCallbacks().onSubscribed();
      latestCallbacks().onUpdate({ deliveryId: 'del-1', status: 'DELIVERED' });
    });
    await flush();

    expect(result.current.data?.status).toBe('DELIVERED');
    expect(close).toHaveBeenCalled();
    expect(mockedClearHandoff).toHaveBeenCalledWith('del-1');
    expect(mockedGetById).toHaveBeenCalledTimes(1); // terminal does not reconcile

    await act(async () => {
      jest.advanceTimersByTime(8000);
    });
    await flush();
    expect(mockedGetById).toHaveBeenCalledTimes(1); // no poll after terminal
  });

  it('falls back to the 4s poll when the socket is unavailable', async () => {
    renderHook(() => useDeliveryTracking('del-1'));
    await flush();
    expect(mockedGetById).toHaveBeenCalledTimes(1);

    await act(async () => {
      latestCallbacks().onUnavailable('drop-exhausted');
    });
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    await flush();
    expect(mockedGetById).toHaveBeenCalledTimes(2); // poll resumed
  });

  it('on a 1008 auth failure: refetches once and re-opens, then polls on a repeat', async () => {
    renderHook(() => useDeliveryTracking('del-1'));
    await flush();
    expect(mockedOpen).toHaveBeenCalledTimes(1);

    await act(async () => {
      await latestCallbacks().onAuthFailed();
    });
    await flush();
    expect(mockedGetById).toHaveBeenCalledTimes(2); // refresh-token getById
    expect(mockedOpen).toHaveBeenCalledTimes(2); // re-opened with the fresh token

    await act(async () => {
      await latestCallbacks().onAuthFailed(); // guard set → fall back to poll
    });
    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    await flush();
    expect(mockedGetById).toHaveBeenCalledTimes(3); // poll fired
  });

  it('tears down on unmount and ignores a late frame', async () => {
    const { unmount } = renderHook(() => useDeliveryTracking('del-1'));
    await flush();
    const cb = latestCallbacks();
    const close = latestClose();

    unmount();
    expect(close).toHaveBeenCalled();
    expect(() => cb.onUpdate({ deliveryId: 'del-1', droneLat: 1 })).not.toThrow();
  });

  it('on id change: closes the old socket and opens one for the new delivery', async () => {
    let currentId: string | undefined = 'del-1';
    const { rerender } = renderHook(() => useDeliveryTracking(currentId));
    await flush();
    const firstClose = latestClose();
    expect(mockedOpen).toHaveBeenLastCalledWith(
      expect.objectContaining({ deliveryId: 'del-1' }),
    );

    currentId = 'del-2';
    rerender(undefined);
    await flush();

    expect(firstClose).toHaveBeenCalled();
    expect(mockedOpen).toHaveBeenLastCalledWith(
      expect.objectContaining({ deliveryId: 'del-2' }),
    );
  });

  it('does not open a socket or fetch when id is undefined', async () => {
    const { result } = renderHook(() => useDeliveryTracking(undefined));
    await flush();
    expect(mockedOpen).not.toHaveBeenCalled();
    expect(mockedGetById).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('settles loading=false when id is undefined (no spinner hang)', async () => {
    const { result } = renderHook(() => useDeliveryTracking(undefined));
    await flush();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('drops an in-flight fetch that resolves after an id switch (no stale stomp)', async () => {
    let resolveDel1!: (v: ApiDelivery) => void;
    const del1 = new Promise<ApiDelivery>((res) => {
      resolveDel1 = res;
    });
    mockedGetById.mockImplementation((reqId: string) =>
      reqId === 'del-1'
        ? del1
        : Promise.resolve({ ...mk('AWAITING_HANDOFF'), id: 'del-2', trackingId: 'TRK-002' }),
    );

    let currentId: string | undefined = 'del-1';
    const { result, rerender } = renderHook(() => useDeliveryTracking(currentId));
    // del-1 fetch is in flight (unresolved). Switch to del-2.
    currentId = 'del-2';
    rerender(undefined);
    await flush(); // del-2 resolves and renders
    expect(result.current.data?.id).toBe('del-2');

    // Now the stale del-1 fetch resolves — it must NOT stomp del-2.
    await act(async () => {
      resolveDel1({ ...mk('IN_TRANSIT'), id: 'del-1' });
      await Promise.resolve();
    });
    expect(result.current.data?.id).toBe('del-2');
  });

  it('does not re-open the socket if the delivery goes terminal during the 1008 refresh', async () => {
    mockedGetById
      .mockResolvedValueOnce(mk('IN_TRANSIT')) // initial
      .mockResolvedValueOnce(mk('DELIVERED')); // 1008 token-refresh resolves terminal
    renderHook(() => useDeliveryTracking('del-1'));
    await flush();
    expect(mockedOpen).toHaveBeenCalledTimes(1);

    await act(async () => {
      await latestCallbacks().onAuthFailed();
    });
    await flush();
    // Refresh saw DELIVERED → terminal teardown → must NOT resurrect a socket.
    expect(mockedOpen).toHaveBeenCalledTimes(1);
  });
});
