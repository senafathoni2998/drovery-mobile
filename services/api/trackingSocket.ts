import { ENV } from '@/config/env';
import type { DeliveryStatus } from '@/services/api/types';
import { getAccessToken } from './tokenStorage';
import { deriveWsBaseUrl } from './wsUrl';

/**
 * One partial tracking frame pushed by the server. Mirrors the backend
 * TrackingUpdatePayload (tracking.publisher.ts): a POSITION frame carries only
 * {deliveryId, droneLat, droneLng}; a STAGE/status frame additionally carries
 * {status, droneStatus}. There is never an `eta` or a full delivery object.
 */
export interface TrackingUpdate {
  deliveryId: string;
  status?: DeliveryStatus;
  droneStatus?: string;
  droneLat?: number;
  droneLng?: number;
}

export type UnavailableReason =
  | 'no-websocket' // no WebSocket impl (e.g. jest/node) — drop straight to poll
  | 'no-token' // not authenticated — can't open the socket
  | 'connect-error' // open() threw, derivation failed, or a 2nd auth failure
  | 'subscribe-error' // server rejected the subscribe (not owner / not found) or ack timed out
  | 'drop-exhausted'; // transient drops exhausted the reconnect budget

export interface TrackingCallbacks {
  /** Server acked the subscribe — the socket is now the authoritative source. */
  onSubscribed: () => void;
  /** A tracking:update frame for THIS delivery. */
  onUpdate: (u: TrackingUpdate) => void;
  /** The socket closed 1008 (auth). Fired on the first occurrence so the caller
   *  can refresh the token and re-open; a second 1008 routes to onUnavailable. */
  onAuthFailed: () => void;
  /** The socket can't serve this delivery — the caller should fall back to poll. */
  onUnavailable: (reason: UnavailableReason) => void;
}

export interface BackoffConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitterMs: number;
  maxAttempts: number;
  subscribeTimeoutMs: number;
}

export interface TrackingConnection {
  /** Idempotent teardown: detaches handlers first, then closes + clears timers. */
  close: () => void;
}

const DEFAULT_BACKOFF: BackoffConfig = {
  baseDelayMs: 1000,
  maxDelayMs: 15000,
  factor: 2,
  jitterMs: 250,
  maxAttempts: 5,
  subscribeTimeoutMs: 8000,
};

interface OpenTrackingOptions {
  deliveryId: string;
  callbacks: TrackingCallbacks;
  getToken?: () => Promise<string | null>;
  wsBaseUrl?: string;
  WebSocketImpl?: typeof WebSocket;
  backoff?: Partial<BackoffConfig>;
}

/**
 * Open a live tracking connection for ONE delivery. The handle is immutable and
 * disposable — one handle = one attempt-chain — so a caller's teardown is always
 * just `close()`. To re-handshake (e.g. after a token refresh) the caller closes
 * this handle and opens a fresh one.
 *
 * Fail-safe by design: if there's no WebSocket impl (jest/node), no token, or a
 * derivation error, it fires onUnavailable so the caller can poll instead of
 * throwing. Never holds a data timer — the caller owns the fallback poll.
 */
export function openTracking(opts: OpenTrackingOptions): TrackingConnection {
  const { deliveryId, callbacks } = opts;
  const getToken = opts.getToken ?? getAccessToken;
  const backoff = { ...DEFAULT_BACKOFF, ...opts.backoff };

  const Impl = opts.WebSocketImpl ?? (globalThis as { WebSocket?: typeof WebSocket }).WebSocket;
  if (!Impl) {
    // No WebSocket (jest-expo/node). Defer so the caller's effect has wired up
    // before we report — and so the callback lands inside React's act() window.
    queueMicrotask(() => callbacks.onUnavailable('no-websocket'));
    return { close: () => {} };
  }

  let wsBaseUrl: string;
  try {
    wsBaseUrl = opts.wsBaseUrl ?? deriveWsBaseUrl(ENV.API_URL);
  } catch {
    queueMicrotask(() => callbacks.onUnavailable('connect-error'));
    return { close: () => {} };
  }

  let ws: WebSocket | null = null;
  let attempt = 0;
  let closedFlag = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let subscribeTimer: ReturnType<typeof setTimeout> | null = null;

  const clearReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };
  const clearSubscribe = () => {
    if (subscribeTimer) {
      clearTimeout(subscribeTimer);
      subscribeTimer = null;
    }
  };

  const detach = () => {
    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;
    }
  };

  // Permanently stop this handle: report it unavailable, then tear the socket
  // down so a later onclose can't scheduleReconnect into a resurrection loop.
  // Used for a server subscribe-rejection AND an ack timeout (same shape).
  const failHandle = (reason: UnavailableReason) => {
    clearSubscribe();
    closedFlag = true;
    detach();
    try {
      ws?.close();
    } catch {
      /* noop */
    }
    callbacks.onUnavailable(reason);
  };

  const scheduleReconnect = () => {
    if (closedFlag) return;
    if (attempt >= backoff.maxAttempts) {
      callbacks.onUnavailable('drop-exhausted');
      return;
    }
    const delay =
      Math.min(backoff.baseDelayMs * backoff.factor ** attempt, backoff.maxDelayMs) +
      Math.floor(Math.random() * backoff.jitterMs);
    attempt += 1;
    reconnectTimer = setTimeout(() => void connect(), delay);
  };

  // A 1008 close never schedules a reconnect on this handle, so each handle can
  // only ever see one. The cross-handshake storm cap (one refresh+reopen, then
  // poll) lives in the hook (auth1008DidReconcileRef) — the authoritative guard.
  const handle1008 = () => {
    callbacks.onAuthFailed();
  };

  const onMessage = (ev: MessageEvent) => {
    let msg: { event?: string; data?: TrackingUpdate };
    try {
      msg = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
    } catch {
      return;
    }
    switch (msg.event) {
      case 'subscribed':
        clearSubscribe();
        attempt = 0;
        callbacks.onSubscribed();
        break;
      case 'tracking:update':
        if (msg.data && msg.data.deliveryId === deliveryId) callbacks.onUpdate(msg.data);
        break;
      case 'error':
        // not-owner / not-found — a permanent rejection. Tear the handle down so
        // a later onclose can't reconnect-loop back to a rejecting endpoint.
        failHandle('subscribe-error');
        break;
      default:
        break;
    }
  };

  const onOpen = () => {
    if (closedFlag || !ws) return;
    ws.send(JSON.stringify({ event: 'subscribe', data: { deliveryId } }));
    subscribeTimer = setTimeout(() => {
      // No ack within the window — treat as unavailable (and stop this handle).
      failHandle('subscribe-error');
    }, backoff.subscribeTimeoutMs);
  };

  const onClose = (ev: CloseEvent) => {
    if (closedFlag) return;
    clearSubscribe();
    if (ev.code === 1008) handle1008();
    else scheduleReconnect();
  };

  const connect = async () => {
    if (closedFlag) return;
    let token: string | null = null;
    try {
      token = await getToken();
    } catch {
      token = null;
    }
    if (closedFlag) return;
    if (!token) {
      callbacks.onUnavailable('no-token');
      return;
    }
    try {
      ws = new Impl(`${wsBaseUrl}/?token=${encodeURIComponent(token)}`);
    } catch {
      scheduleReconnect();
      return;
    }
    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onerror = () => {
      /* log-only; RN always follows with onclose */
    };
    ws.onclose = onClose;
  };

  const close = () => {
    closedFlag = true;
    clearReconnect();
    clearSubscribe();
    detach();
    if (ws) {
      try {
        ws.close(1000, 'client teardown');
      } catch {
        /* noop */
      }
      ws = null;
    }
  };

  void connect();
  return { close };
}
