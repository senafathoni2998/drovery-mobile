import { useCallback, useEffect, useRef, useState } from 'react';
import { ticketsApi, type Message } from '@/features/support/services/ticketsApi';
import {
  openSupportChat,
  type SupportConnection,
} from '@/features/support/services/supportSocket';

/** Merge a message into the list, deduping by id (the WS send-ack overlaps the
 *  Redis fanout, and the REST send response overlaps both). Keeps chronological
 *  order by createdAt. */
function mergeMessage(prev: Message[], incoming: Message): Message[] {
  const existing = prev.findIndex(m => m.id === incoming.id);
  const next = existing >= 0 ? prev.map(m => (m.id === incoming.id ? incoming : m)) : [...prev, incoming];
  return next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function useTicketThread(ticketId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The live socket handle + whether it's currently the authoritative source.
  const connRef = useRef<SupportConnection | null>(null);
  const socketUpRef = useRef(false);
  // One refresh+reopen on a 1008 auth close, then fall back to REST — the
  // cross-handshake storm cap (mirrors the tracking hook's auth reconcile guard).
  const authReconciledRef = useRef(false);

  const appendMessage = useCallback((incoming: Message) => {
    if (incoming.ticketId !== ticketId) return;
    setMessages(prev => mergeMessage(prev, incoming));
  }, [ticketId]);

  // REST history load — also the polling backstop when the socket is down.
  const loadHistory = useCallback(async () => {
    try {
      setError(null);
      const result = await ticketsApi.getMessages(ticketId);
      setMessages(prev => {
        // Reconcile server history with any optimistic/live messages already held.
        let next = prev;
        for (const m of result.messages) next = mergeMessage(next, m);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    if (!ticketId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const openSocket = () => {
      if (cancelled) return;
      connRef.current = openSupportChat({
        ticketId,
        callbacks: {
          onSubscribed: () => {
            socketUpRef.current = true;
          },
          onMessage: appendMessage,
          onAuthFailed: () => {
            socketUpRef.current = false;
            // First 1008: close + reopen once (a fresh token is fetched on
            // connect). A second one routes to onUnavailable → REST fallback.
            if (authReconciledRef.current) return;
            authReconciledRef.current = true;
            connRef.current?.close();
            connRef.current = null;
            openSocket();
          },
          onUnavailable: () => {
            // No live socket — REST stays authoritative (history already loaded;
            // send() falls back to the REST endpoint automatically).
            socketUpRef.current = false;
          },
        },
      });
    };

    // Load history first, then bring the live socket up over it.
    void loadHistory().then(openSocket);

    return () => {
      cancelled = true;
      socketUpRef.current = false;
      connRef.current?.close();
      connRef.current = null;
    };
  }, [ticketId, appendMessage, loadHistory]);

  const send = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    // Prefer the live socket; the 'message:new'/'message:sent' frame echoes back
    // (deduped by id). When the socket is down, POST over REST — same effect
    // (persist + fanout) — and merge the persisted response directly.
    if (socketUpRef.current && connRef.current) {
      connRef.current.send(trimmed);
      return;
    }
    const persisted = await ticketsApi.sendMessage(ticketId, trimmed);
    appendMessage(persisted);
  }, [ticketId, appendMessage]);

  return { messages, loading, error, send };
}
