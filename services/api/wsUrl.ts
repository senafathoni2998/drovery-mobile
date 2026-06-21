// Derive the WebSocket origin from the HTTP API base URL.
//
// The backend WS gateway attaches to the SAME http server at ROOT — the
// `/api/v1` global prefix is HTTP-only and does NOT apply to the socket path
// (see backend main.ts: app.useWebSocketAdapter(new WsAdapter(app)) +
// setGlobalPrefix). So the socket lives at ws(s)://<host:port>/ with no prefix.
//
// We parse with a regex rather than `new URL()` to avoid React Native URL
// polyfill edge cases — we only need the scheme + authority (host[:port]).
// Host:port is preserved verbatim (never hardcode :3000 — prod TLS may
// terminate on 443).
export function deriveWsBaseUrl(apiUrl: string): string {
  const m = apiUrl.match(/^(https?):\/\/([^/]+)/);
  if (!m) throw new Error(`Invalid API_URL: ${apiUrl}`);
  const scheme = m[1] === 'https' ? 'wss' : 'ws';
  return `${scheme}://${m[2]}`;
}
