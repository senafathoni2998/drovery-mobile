import type { ApiDelivery, ApiDeliveryTracking } from '@/services/api/types';
import type { TrackingUpdate } from '@/services/api/trackingSocket';

function emptyTracking(deliveryId: string): ApiDeliveryTracking {
  return {
    id: '',
    deliveryId,
    droneLat: null,
    droneLng: null,
    droneStatus: null,
    routeJson: null,
    eta: null,
  };
}

/**
 * Apply a partial WS tracking frame onto the held delivery, returning a NEW
 * object (or the same reference if nothing changed). The frame is a deliberate
 * partial — a position frame carries only coords, a stage frame adds
 * status/droneStatus — and it NEVER carries eta/proof/payment/failureReason, so
 * those are left untouched here (only a reconcile getById refreshes them).
 *
 * Rule 0: with no base delivery yet (initial getById in flight) we DROP the
 * frame — we must never fabricate a partial ApiDelivery, since the map screen
 * reads fromLat/toLat/addresses/trackingId the frame doesn't include.
 */
export function mergeTrackingUpdate(
  prev: ApiDelivery | null,
  u: TrackingUpdate,
): ApiDelivery | null {
  if (prev === null) return prev;

  const hasPos = u.droneLat !== undefined || u.droneLng !== undefined;
  const hasDroneStatus = u.droneStatus !== undefined;
  const hasStatus = u.status !== undefined && u.status !== prev.status;
  if (!hasPos && !hasDroneStatus && !hasStatus) return prev; // referential no-op

  const next: ApiDelivery = { ...prev };

  if (hasPos || hasDroneStatus) {
    const t: ApiDeliveryTracking = { ...(prev.tracking ?? emptyTracking(prev.id)) };
    // undefined-checks, NOT truthiness: a 0 / negative coordinate is valid.
    if (u.droneLat !== undefined) t.droneLat = u.droneLat;
    if (u.droneLng !== undefined) t.droneLng = u.droneLng;
    if (u.droneStatus !== undefined) t.droneStatus = u.droneStatus;
    next.tracking = t; // preserves eta / routeJson / id
  }

  if (u.status !== undefined) next.status = u.status;

  return next;
}

/** True when the frame carries a status that actually differs from the held one. */
export function isStatusChange(prev: ApiDelivery | null, u: TrackingUpdate): boolean {
  return u.status !== undefined && prev !== null && prev.status !== u.status;
}
