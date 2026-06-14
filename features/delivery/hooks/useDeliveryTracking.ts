import { useCallback, useEffect, useRef, useState } from 'react';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import { clearHandoffCode } from '@/features/delivery/services/handoffCodeStore';
import {
  isStatusChange,
  mergeTrackingUpdate,
} from '@/features/delivery/services/deliveryTrackingMerge';
import { presentLocalNotification } from '@/services/notifications/push';
import { statusMeta } from '@/services/deliveryStatus';
import {
  openTracking,
  type TrackingCallbacks,
  type TrackingConnection,
  type TrackingUpdate,
} from '@/services/api/trackingSocket';
import type { ApiDelivery, DeliveryStatus } from '@/services/api/types';

const POLL_INTERVAL_MS = 4000;

const STATUS_MESSAGE: Record<DeliveryStatus, string> = {
  SCHEDULED: 'Your delivery is scheduled.',
  PENDING: 'Your delivery request has been received.',
  CONFIRMED: 'Your delivery has been confirmed.',
  DRONE_ASSIGNED: 'A drone has been assigned to your delivery.',
  PICKUP_IN_PROGRESS: 'The drone is heading to the pickup location.',
  IN_TRANSIT: 'Your package is on its way! 🚁',
  AWAITING_HANDOFF: 'The drone has arrived — confirm the handoff to receive it.',
  DELIVERED: 'Your package has been delivered. 🎉',
  CANCELED: 'Your delivery has been canceled.',
  RETURNING: 'The drone is returning your package to base.',
  DELIVERY_FAILED: 'Your delivery could not be completed.',
  RETURNED_TO_BASE: 'Your package has been returned to base.',
};

/**
 * Loads a delivery and keeps it live. WS-PRIMARY / POLL-FALLBACK: while a
 * tracking socket is connected+subscribed, position/status frames are merged in
 * place (zero HTTP); if the socket is unavailable or drops past its reconnect
 * budget, the hook falls back to the proven 4s getById poll so tracking never
 * goes dark. A genuine status transition fires a local notification (never on
 * first load); polling/socket both stop once the delivery reaches a terminal
 * status. The socket is owned per hook instance and torn down on unmount/id-change.
 */
export function useDeliveryTracking(id: string | undefined) {
  const [data, setData] = useState<ApiDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connRef = useRef<TrackingConnection | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // prevStatusRef drives notify de-dup; statusRef lets timers/teardown decide
  // when to stop; dataRef is the synchronous merge base (no stale closure).
  const prevStatusRef = useRef<DeliveryStatus | null>(null);
  const statusRef = useRef<DeliveryStatus | null>(null);
  const dataRef = useRef<ApiDelivery | null>(null);
  const mountedRef = useRef(true);
  // The currently-subscribed id. An async getById captures its request id and
  // compares against this on resolution, so a response that arrives AFTER the id
  // switched (mountedRef alone can't tell "unmounted" from "a newer mount") is
  // dropped instead of stomping the new delivery's data.
  const idRef = useRef(id);
  // Monotonic token so only the latest reconcile may write (out-of-order getById).
  const reconcileSeqRef = useRef(0);
  // Cross-handshake guard: a 1008 → refresh-token → re-open may only happen once
  // before we give up on the socket and poll (prevents a 1008→getById→1008 loop).
  const auth1008DidReconcileRef = useRef(false);

  // The SINGLE place prevStatusRef is read/advanced, so the WS push, the
  // reconcile getById, and the fallback poll all de-dup through it.
  const notifyOnStatusTransition = useCallback(
    (nextStatus: DeliveryStatus, deliveryId: string) => {
      if (
        prevStatusRef.current !== null &&
        prevStatusRef.current !== nextStatus
      ) {
        void presentLocalNotification(
          statusMeta(nextStatus).label,
          STATUS_MESSAGE[nextStatus] ?? 'Your delivery status has updated.',
          { deliveryId, status: nextStatus },
        );
      }
      prevStatusRef.current = nextStatus;
    },
    [],
  );

  const stopPoll = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const applyTerminalIfNeeded = useCallback(
    (status: DeliveryStatus, deliveryId: string) => {
      statusRef.current = status;
      if (statusMeta(status).terminal) {
        // Settled — drop the cached handoff code and shut down both sources.
        void clearHandoffCode(deliveryId);
        connRef.current?.close();
        connRef.current = null;
        stopPoll();
      }
    },
    [stopPoll],
  );

  const fetchTracking = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!id) return;
      const reqId = id; // resolution that crosses an id-switch is stale → drop
      const silent = opts?.silent ?? false;
      try {
        if (!silent && mountedRef.current) setLoading(true);
        if (mountedRef.current) setError(null);
        const result = await deliveryApi.getById(reqId);
        if (!mountedRef.current || idRef.current !== reqId) return;
        notifyOnStatusTransition(result.status, result.id);
        statusRef.current = result.status;
        dataRef.current = result; // keep the merge base in sync (critical)
        setData(result);
        if (statusMeta(result.status).terminal)
          applyTerminalIfNeeded(result.status, result.id);
      } catch (err) {
        if (mountedRef.current && idRef.current === reqId)
          setError(err instanceof Error ? err.message : 'Failed to load tracking');
      } finally {
        if (!silent && mountedRef.current && idRef.current === reqId) setLoading(false);
      }
    },
    [id, notifyOnStatusTransition, applyTerminalIfNeeded],
  );

  const startPoll = useCallback(() => {
    if (pollRef.current || !id) return;
    pollRef.current = setInterval(() => {
      if (statusRef.current && statusMeta(statusRef.current).terminal) {
        stopPoll();
        return;
      }
      void fetchTracking({ silent: true });
    }, POLL_INTERVAL_MS);
  }, [id, fetchTracking, stopPoll]);

  // One authoritative getById after a non-terminal status change, to backfill
  // eta/proof/payment/failureReason the push omits. prevStatusRef was already
  // advanced by the push, so this does NOT re-notify.
  const reconcile = useCallback(async () => {
    if (!id) return;
    const reqId = id;
    const token = ++reconcileSeqRef.current;
    const r = await deliveryApi.getById(reqId).catch(() => null);
    if (!mountedRef.current || idRef.current !== reqId || !r) return;
    if (token !== reconcileSeqRef.current) return; // a newer reconcile won — drop
    dataRef.current = r;
    notifyOnStatusTransition(r.status, r.id);
    statusRef.current = r.status;
    setData(r);
    if (statusMeta(r.status).terminal) applyTerminalIfNeeded(r.status, r.id);
  }, [id, notifyOnStatusTransition, applyTerminalIfNeeded]);

  const handlePush = useCallback(
    (u: TrackingUpdate) => {
      if (!mountedRef.current || !id) return;
      const before = dataRef.current;
      const next = mergeTrackingUpdate(before, u);
      if (next === before) return; // referential no-op (e.g. push before first load)
      dataRef.current = next;
      setData(next); // immediate marker glide
      if (isStatusChange(before, u) && u.status !== undefined) {
        notifyOnStatusTransition(u.status, id); // advance BEFORE reconcile (de-dup)
        if (statusMeta(u.status).terminal) applyTerminalIfNeeded(u.status, id);
        else {
          statusRef.current = u.status;
          void reconcile();
        }
      }
    },
    [id, notifyOnStatusTransition, applyTerminalIfNeeded, reconcile],
  );

  useEffect(() => {
    mountedRef.current = true;
    // `active` is captured fresh per effect run and flipped false in THIS run's
    // cleanup. Unlike the shared mountedRef, it lets a stale-closure callback
    // tell "my effect instance was torn down" from "a newer instance mounted",
    // so a suspended onAuthFailed can't resurrect a socket for the old delivery.
    let active = true;
    // Reset per-delivery tracking when (re)subscribing.
    idRef.current = id;
    prevStatusRef.current = null;
    statusRef.current = null;
    dataRef.current = null;
    reconcileSeqRef.current = 0;
    auth1008DidReconcileRef.current = false;

    // Initial full fetch: seeds data + primes prevStatusRef (so a WS push can't
    // false-notify) and warms the access token via apiClient's 401-refresh.
    fetchTracking();

    if (!id) {
      // No delivery to track — settle the public state so a consumer gating a
      // spinner on `loading` doesn't hang forever.
      if (mountedRef.current) {
        setLoading(false);
        setData(null);
        setError(null);
      }
      return () => {
        active = false;
        mountedRef.current = false;
      };
    }

    const callbacks: TrackingCallbacks = {
      onSubscribed: () => {
        if (!active) return;
        stopPoll(); // socket is authoritative — no dual sources
      },
      onUpdate: (u) => {
        if (active) handlePush(u);
      },
      onUnavailable: () => {
        if (!active) return;
        startPoll();
      },
      onAuthFailed: async () => {
        if (!active) return;
        if (auth1008DidReconcileRef.current) {
          startPoll();
          return;
        }
        auth1008DidReconcileRef.current = true;
        const owned = connRef.current; // the handle this callback owns
        // getById → apiClient refreshes the token → SecureStore now fresh.
        await fetchTracking({ silent: true });
        // Dropped if the effect was torn down / the delivery switched, or the
        // handle was swapped out from under us, or the delivery already settled
        // during the refresh (terminal already closed both sources).
        if (!active || connRef.current !== owned) return;
        if (statusRef.current && statusMeta(statusRef.current).terminal) return;
        connRef.current?.close();
        connRef.current = openTracking({ deliveryId: id, callbacks });
      },
    };
    connRef.current = openTracking({ deliveryId: id, callbacks });

    return () => {
      active = false;
      mountedRef.current = false;
      connRef.current?.close();
      connRef.current = null;
      stopPoll();
    };
  }, [id, fetchTracking, startPoll, handlePush, stopPoll]);

  return { data, loading, error, refetch: fetchTracking };
}
