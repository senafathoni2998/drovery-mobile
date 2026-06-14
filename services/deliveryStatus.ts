import type { DeliveryFailureReason, DeliveryStatus } from './api/types';

/**
 * Single source of truth for how a delivery status is presented across the app
 * (detail timeline, track screen, home progress, order cards). Typed as a
 * Record<DeliveryStatus, …>, so adding a backend status is a COMPILE error until
 * it's handled everywhere — which is exactly the drift that previously left the
 * exception statuses (RETURNING / DELIVERY_FAILED / RETURNED_TO_BASE /
 * AWAITING_HANDOFF) rendering as "Pending" / step 0.
 */
export type DeliveryStatusKind =
  | 'pending' // not yet dispatched
  | 'active' // drone in flight on the happy path
  | 'awaiting' // arrived, waiting for the recipient handoff
  | 'success' // delivered
  | 'canceled' // canceled before dispatch
  | 'returning' // exception: drone flying the package home (transient)
  | 'failed' // exception: ended undelivered (terminal)
  | 'returned'; // exception: package made it back to base (terminal)

export interface DeliveryStatusMeta {
  label: string;
  kind: DeliveryStatusKind;
  color: string; // foreground (text/icon)
  bg: string; // chip background
  /** 0–100 for the home progress bar. */
  progressPct: number;
  /** Index into the detail-screen STEPS timeline (happy path). */
  step: number;
  /** Settled outcome — no further transitions. */
  terminal: boolean;
  /** An exception branch (off the happy path) — carries a failureReason. */
  exception: boolean;
}

// Palette matches the existing chips: sky=waiting, teal=in-flight, green=success,
// red=failed/canceled, amber=returning/returned.
const SKY = { color: '#0369A1', bg: '#E0F2FE' };
const TEAL = { color: '#0D9488', bg: '#F0FDFA' };
const GREEN = { color: '#047857', bg: '#ECFDF5' };
const RED = { color: '#B91C1C', bg: '#FEF2F2' };
const AMBER = { color: '#B45309', bg: '#FFFBEB' };
const INDIGO = { color: '#4F46E5', bg: '#EEF2FF' };

export const STATUS_META: Record<DeliveryStatus, DeliveryStatusMeta> = {
  SCHEDULED: { label: 'Scheduled', kind: 'pending', ...INDIGO, progressPct: 5, step: 0, terminal: false, exception: false },
  PENDING: { label: 'Pending', kind: 'pending', ...SKY, progressPct: 10, step: 0, terminal: false, exception: false },
  CONFIRMED: { label: 'Confirmed', kind: 'active', ...SKY, progressPct: 20, step: 1, terminal: false, exception: false },
  DRONE_ASSIGNED: { label: 'Drone Assigned', kind: 'active', ...TEAL, progressPct: 35, step: 1, terminal: false, exception: false },
  PICKUP_IN_PROGRESS: { label: 'Pickup in Progress', kind: 'active', ...TEAL, progressPct: 50, step: 2, terminal: false, exception: false },
  IN_TRANSIT: { label: 'In Transit', kind: 'active', ...TEAL, progressPct: 75, step: 3, terminal: false, exception: false },
  AWAITING_HANDOFF: { label: 'Awaiting Handoff', kind: 'awaiting', ...TEAL, progressPct: 90, step: 4, terminal: false, exception: false },
  DELIVERED: { label: 'Delivered', kind: 'success', ...GREEN, progressPct: 100, step: 5, terminal: true, exception: false },
  CANCELED: { label: 'Canceled', kind: 'canceled', ...RED, progressPct: 0, step: 0, terminal: true, exception: false },
  RETURNING: { label: 'Returning to Base', kind: 'returning', ...AMBER, progressPct: 60, step: 3, terminal: false, exception: true },
  DELIVERY_FAILED: { label: 'Delivery Failed', kind: 'failed', ...RED, progressPct: 100, step: 4, terminal: true, exception: true },
  RETURNED_TO_BASE: { label: 'Returned to Base', kind: 'returned', ...AMBER, progressPct: 100, step: 3, terminal: true, exception: true },
};

const FALLBACK: DeliveryStatusMeta = {
  label: 'Unknown',
  kind: 'pending',
  color: '#64748B',
  bg: '#F1F5F9',
  progressPct: 0,
  step: 0,
  terminal: false,
  exception: false,
};

/** Safe lookup — tolerates an unrecognized status string from the API. */
export function statusMeta(status: string | null | undefined): DeliveryStatusMeta {
  return (status && STATUS_META[status as DeliveryStatus]) || FALLBACK;
}

export function deliveryStatusLabel(status: string | null | undefined): string {
  return statusMeta(status).label;
}

const FAILURE_REASON_MESSAGE: Record<DeliveryFailureReason, string> = {
  RECIPIENT_UNAVAILABLE: 'No one was available to receive the package.',
  WEATHER_ABORT: 'The flight was aborted due to unsafe weather.',
  UNSAFE_DROP_ZONE: 'The drop-off location was unsafe for landing.',
  MECHANICAL: 'A drone fault interrupted the flight.',
  ADMIN_ABORT: 'The delivery was stopped by Drovery support.',
  OTHER: 'The delivery could not be completed.',
};

/** A human-readable explanation for an exception outcome, or null if none. */
export function failureReasonMessage(
  reason: DeliveryFailureReason | null | undefined,
): string | null {
  return reason ? FAILURE_REASON_MESSAGE[reason] : null;
}
