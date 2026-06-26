import { ENV } from '@/config/env';
import { getAccessToken } from '@/services/api/tokenStorage';
import { deriveWsBaseUrl } from '@/services/api/wsUrl';
import type { Message } from './ticketsApi';

/**
 * Live support-chat socket for ONE ticket. Modeled EXACTLY on the tracking
 * socket (services/api/trackingSocket.ts): derive the ws(s) origin from the HTTP
 * API base, authenticate with a JWT in the handshake query (?token=...), and
 * exchange {event,data} JSON frames.
 *
 * The support gateway is mounted at the DISTINCT path /ws/support (see backend
 * support-chat.gateway.ts) and speaks:
 *   - 'subscribe'   {ticketId}            → ack 'subscribed' {ticketId}
 *   - 'unsubscribe' {ticketId}            → ack 'unsubscribed' {ticketId}
 *   - 'send'        {ticketId, content}   → sync ack 'message:sent' {...message}
 * Persisted messages fan out from Redis as 'message:new' {...message} frames to
 * every subscribed client (incl. the sender's other devices). We surface BOTH
 * 'message:new' and the synchronous 'message:sent' ack via onMessage — the
 * caller dedupes by id, so the overlap is harmless.
 *
 * Fail-safe by design: no WebSocket impl (jest/node), no token, or a derivation
 * error fires onUnavailable so the caller can fall back to REST polling instead
 * of throwing. The handle is disposable — one handle = one attempt-chain — so
 * teardown is always just close().
 */

export type SupportUnavailableReason =
  | 'no-websocket' // no WebSocket impl (e.g. jest/node)
  | 'no-token' // not authenticated — can't open the socket
  | 'connect-error' // open() threw or URL derivation failed
  | 'subscribe-error' // server rejected the subscribe (not owner / not found) or ack timed out
  | 'drop-exhausted'; // transient drops exhausted the reconnect budget

export interface SupportCallbacks {
  /** Server acked the subscribe — the socket is the authoritative source now. */
  onSubscribed: () => void;
  /** A persisted chat message for THIS ticket (live fanout or send-ack). */
  onMessage: (message: Message) => void;
  /** Socket closed 1008 (auth). Fired on the first occurrence so the caller can
   *  refresh the token and re-open; a second 1008 routes to onUnavailable. */
  onAuthFailed: () => void;
  /** The socket can't serve this ticket — caller should fall back to REST. */
  onUnavailable: (reason: SupportUnavailableReason) => void;
}

export interface SupportBackoffConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  factor: number;
  jitterMs: number;
  maxAttempts: number;
  subscribeTimeoutMs: number;
}

export interface SupportConnection {
  /** Send a chat message over the live socket. No-op if not open. */
  send: (content: string) => void;
  /** Idempotent teardown: detaches handlers, unsubscribes, closes, clears timers. */
  close: () => void;
}

const DEFAULT_BACKOFF: SupportBackoffConfig = {
  baseDelayMs: 1000,
  maxDelayMs: 15000,
  factor: 2,
  jitterMs: 250,
  maxAttempts: 5,
  subscribeTimeoutMs: 8000,
};

interface OpenSupportOptions {
  ticketId: string;
  callbacks: SupportCallbacks;
  getToken?: () => Promise<string | null>;
  wsBaseUrl?: string;
  WebSocketImpl?: typeof WebSocket;
  backoff?: Partial<SupportBackoffConfig>;
}

function isMessage(d: unknown): d is Message {
  return (
    typeof d === 'object' &&
    d !== null &&
    typeof (d as Message).id === 'string' &&
    typeof (d as Message).ticketId === 'string' &&
    typeof (d as Message).content === 'string'
  );
}

export function openSupportChat(opts: OpenSupportOptions): SupportConnection {
  const { ticketId, callbacks } = opts;
  const getToken = opts.getToken ?? getAccessToken;
  const backoff = { ...DEFAULT_BACKOFF, ...opts.backoff };

  const Impl = opts.WebSocketImpl ?? (globalThis as { WebSocket?: typeof WebSocket }).WebSocket;
  if (!Impl) {
    // No WebSocket (jest-expo/node). Defer so the caller's effect has wired up
    // before we report — and so the callback lands inside React's act() window.
    queueMicrotask(() => callbacks.onUnavailable('no-websocket'));
    return { send: () => {}, close: () => {} };
  }

  let wsBaseUrl: string;
  try {
    wsBaseUrl = opts.wsBaseUrl ?? deriveWsBaseUrl(ENV.API_URL);
  } catch {
    queueMicrotask(() => callbacks.onUnavailable('connect-error'));
    return { send: () => {}, close: () => {} };
  }

  let ws: WebSocket | null = null;
  let attempt = 0;
  let closedFlag = false;
  let subscribed = false;
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
  const failHandle = (reason: SupportUnavailableReason) => {
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
  // fall back) lives in the hook — the authoritative guard.
  const handle1008 = () => {
    callbacks.onAuthFailed();
  };

  const onMessage = (ev: MessageEvent) => {
    let msg: { event?: string; data?: unknown };
    try {
      msg = JSON.parse(typeof ev.data === 'string' ? ev.data : String(ev.data));
    } catch {
      return;
    }
    switch (msg.event) {
      case 'subscribed':
        clearSubscribe();
        attempt = 0;
        subscribed = true;
        callbacks.onSubscribed();
        break;
      // Live Redis fanout AND the synchronous ack for our own 'send' both carry a
      // full message payload. Surface both; the caller dedupes by id.
      case 'message:new':
      case 'message:sent':
        if (isMessage(msg.data) && msg.data.ticketId === ticketId) {
          callbacks.onMessage(msg.data);
        }
        break;
      case 'error':
        // not-owner / not-found / ticket-closed — a permanent rejection. Tear the
        // handle down so a later onclose can't reconnect-loop to a rejecting peer.
        failHandle('subscribe-error');
        break;
      default:
        break;
    }
  };

  const onOpen = () => {
    if (closedFlag || !ws) return;
    ws.send(JSON.stringify({ event: 'subscribe', data: { ticketId } }));
    subscribeTimer = setTimeout(() => {
      // No ack within the window — treat as unavailable (and stop this handle).
      failHandle('subscribe-error');
    }, backoff.subscribeTimeoutMs);
  };

  const onClose = (ev: CloseEvent) => {
    if (closedFlag) return;
    clearSubscribe();
    subscribed = false;
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
      ws = new Impl(`${wsBaseUrl}/ws/support?token=${encodeURIComponent(token)}`);
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

  const send = (content: string) => {
    const trimmed = content.trim();
    if (closedFlag || !subscribed || !ws || !trimmed) return;
    try {
      ws.send(JSON.stringify({ event: 'send', data: { ticketId, content: trimmed } }));
    } catch {
      /* noop — the caller's REST fallback owns delivery if the socket is down */
    }
  };

  const close = () => {
    closedFlag = true;
    clearReconnect();
    clearSubscribe();
    if (ws) {
      // Best-effort unsubscribe before teardown (mirrors the gateway contract).
      try {
        if (subscribed && ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ event: 'unsubscribe', data: { ticketId } }));
        }
      } catch {
        /* noop */
      }
    }
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
  return { send, close };
}
