import {
  openTracking,
  type TrackingCallbacks,
  type TrackingConnection,
} from '@/services/api/trackingSocket';

// Minimal fake WebSocket we can drive by hand (jest-expo/node has no global WS).
class FakeWebSocket {
  static instances: FakeWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: ((ev: { code: number }) => void) | null = null;
  sent: string[] = [];
  closed = false;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
  }
  send(d: string) {
    this.sent.push(d);
  }
  close() {
    this.closed = true;
  }
  // test drivers
  fireOpen() {
    this.onopen?.();
  }
  fireMessage(obj: unknown) {
    this.onmessage?.({ data: JSON.stringify(obj) });
  }
  fireClose(code: number) {
    this.onclose?.({ code });
  }
}

const mkCallbacks = (): jest.Mocked<TrackingCallbacks> => ({
  onSubscribed: jest.fn(),
  onUpdate: jest.fn(),
  onAuthFailed: jest.fn(),
  onUnavailable: jest.fn(),
});

let conns: TrackingConnection[] = [];

const open = (cb: TrackingCallbacks, backoff = {}) => {
  const conn = openTracking({
    deliveryId: 'del-1',
    callbacks: cb,
    getToken: async () => 'tok-123',
    wsBaseUrl: 'ws://host:3000',
    WebSocketImpl: FakeWebSocket as unknown as typeof WebSocket,
    backoff,
  });
  conns.push(conn);
  return conn;
};

const flush = () => Promise.resolve().then(() => Promise.resolve());

beforeEach(() => {
  FakeWebSocket.instances = [];
});

afterEach(() => {
  // Close any open handle so an armed subscribe/reconnect timer can't leak.
  conns.forEach((c) => c.close());
  conns = [];
});

describe('openTracking', () => {
  it('opens with the token in the query and sends a subscribe frame on open', async () => {
    const cb = mkCallbacks();
    open(cb);
    await flush(); // connect() awaits getToken before constructing the socket
    const sock = FakeWebSocket.instances[0];
    expect(sock.url).toBe('ws://host:3000/?token=tok-123');

    sock.fireOpen();
    expect(JSON.parse(sock.sent[0])).toEqual({
      event: 'subscribe',
      data: { deliveryId: 'del-1' },
    });
  });

  it('routes subscribed + tracking:update and filters by deliveryId', async () => {
    const cb = mkCallbacks();
    open(cb);
    await flush();
    const sock = FakeWebSocket.instances[0];
    sock.fireOpen();

    sock.fireMessage({ event: 'subscribed', data: { deliveryId: 'del-1' } });
    expect(cb.onSubscribed).toHaveBeenCalledTimes(1);

    sock.fireMessage({ event: 'tracking:update', data: { deliveryId: 'del-1', droneLat: 1 } });
    expect(cb.onUpdate).toHaveBeenCalledWith({ deliveryId: 'del-1', droneLat: 1 });

    // A frame for a different delivery is ignored.
    sock.fireMessage({ event: 'tracking:update', data: { deliveryId: 'del-OTHER', droneLat: 9 } });
    expect(cb.onUpdate).toHaveBeenCalledTimes(1);
  });

  it('an error frame reports unavailable AND tears down (no reconnect on a later drop)', async () => {
    const cb = mkCallbacks();
    open(cb);
    await flush();
    const sock = FakeWebSocket.instances[0];
    sock.fireOpen();

    sock.fireMessage({ event: 'error', data: { message: 'no access' } });
    expect(cb.onUnavailable).toHaveBeenCalledWith('subscribe-error');
    expect(sock.closed).toBe(true);

    // A subsequent transient drop must NOT resurrect the handle.
    sock.fireClose(1006);
    await flush();
    expect(FakeWebSocket.instances).toHaveLength(1);
  });

  it('a 1008 close reports auth failure (and does not reconnect itself)', async () => {
    const cb = mkCallbacks();
    open(cb);
    await flush();
    const sock = FakeWebSocket.instances[0];
    sock.fireOpen();
    sock.fireClose(1008);

    expect(cb.onAuthFailed).toHaveBeenCalledTimes(1);
    await flush();
    expect(FakeWebSocket.instances).toHaveLength(1); // 1008 never reconnects the same handle
  });

  it('reports unavailable when there is no token', async () => {
    const cb = mkCallbacks();
    openTracking({
      deliveryId: 'del-1',
      callbacks: cb,
      getToken: async () => null,
      wsBaseUrl: 'ws://host:3000',
      WebSocketImpl: FakeWebSocket as unknown as typeof WebSocket,
    });
    await flush();
    expect(cb.onUnavailable).toHaveBeenCalledWith('no-token');
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it('reports no-websocket when no WebSocket implementation is available', async () => {
    // The jest-expo env now provides a global WebSocket, so openTracking's fallback
    // (WebSocketImpl ?? globalThis.WebSocket) finds one. Remove it for this test to exercise
    // the genuinely-absent path, and restore it afterward so other suites are unaffected.
    const savedWS = (globalThis as { WebSocket?: unknown }).WebSocket;
    delete (globalThis as { WebSocket?: unknown }).WebSocket;
    try {
      const cb = mkCallbacks();
      openTracking({
        deliveryId: 'del-1',
        callbacks: cb,
        getToken: async () => 'tok',
        wsBaseUrl: 'ws://host:3000',
        WebSocketImpl: undefined,
      });
      await flush();
      expect(cb.onUnavailable).toHaveBeenCalledWith('no-websocket');
    } finally {
      (globalThis as { WebSocket?: unknown }).WebSocket = savedWS;
    }
  });

  it('close() is idempotent and detaches handlers so late frames are inert', async () => {
    const cb = mkCallbacks();
    const conn = open(cb);
    await flush();
    const sock = FakeWebSocket.instances[0];
    sock.fireOpen();

    conn.close();
    expect(sock.closed).toBe(true);
    conn.close(); // no throw
    // A late frame after teardown does nothing (handlers detached).
    sock.fireMessage({ event: 'tracking:update', data: { deliveryId: 'del-1', droneLat: 5 } });
    expect(cb.onUpdate).not.toHaveBeenCalled();
  });

  it('reconnects after a transient (non-1008) drop', async () => {
    jest.useFakeTimers();
    try {
      const cb = mkCallbacks();
      open(cb, { baseDelayMs: 1000, jitterMs: 0 });
      await flush();
      const sock = FakeWebSocket.instances[0];
      sock.fireOpen();
      sock.fireClose(1006); // transient

      jest.advanceTimersByTime(1100);
      await flush(); // reconnect connect() awaits getToken
      expect(FakeWebSocket.instances.length).toBe(2);
    } finally {
      jest.useRealTimers();
    }
  });
});
