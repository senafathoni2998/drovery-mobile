import { useCallback, useEffect, useRef, useState } from 'react';
import { deliveryApi } from '@/features/delivery/services/deliveryApi';
import { presentLocalNotification } from '@/services/notifications/push';
import { statusMeta } from '@/services/deliveryStatus';
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
 * Loads a delivery and then polls it on an interval so the map/tracking UI
 * stays live as the drone moves. When the status changes between polls, fires
 * a local notification so the user is told even without remote push. Polling
 * stops automatically once the delivery reaches a terminal status.
 */
export function useDeliveryTracking(id: string | undefined) {
  const [data, setData] = useState<ApiDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Last seen status: prevStatusRef drives change-detection; statusRef lets the
  // interval decide when to stop without re-subscribing.
  const prevStatusRef = useRef<DeliveryStatus | null>(null);
  const statusRef = useRef<DeliveryStatus | null>(null);

  const fetchTracking = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!id) return;
      const silent = opts?.silent ?? false;
      try {
        if (!silent) setLoading(true);
        setError(null);
        const result = await deliveryApi.getById(id);

        // Notify on a genuine status transition (never on the first load).
        if (
          prevStatusRef.current !== null &&
          prevStatusRef.current !== result.status
        ) {
          void presentLocalNotification(
            statusMeta(result.status).label,
            STATUS_MESSAGE[result.status] ??
              'Your delivery status has updated.',
            { deliveryId: result.id, status: result.status },
          );
        }
        prevStatusRef.current = result.status;
        statusRef.current = result.status;

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load tracking',
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    // Reset transition tracking when switching deliveries.
    prevStatusRef.current = null;
    statusRef.current = null;

    fetchTracking();
    if (!id) return;

    const interval = setInterval(() => {
      // Stop polling at a terminal status (DELIVERED/CANCELED/DELIVERY_FAILED/
      // RETURNED_TO_BASE). RETURNING is transient — keep polling so the map tracks
      // the drone flying the package home.
      if (statusRef.current && statusMeta(statusRef.current).terminal) {
        clearInterval(interval);
        return;
      }
      void fetchTracking({ silent: true });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [id, fetchTracking]);

  return { data, loading, error, refetch: fetchTracking };
}
