import type { DeliveryFailureReason, DeliveryStatus } from '@/services/api/types';
import {
  STATUS_META,
  failureReasonMessage,
  statusMeta,
} from '@/services/deliveryStatus';

// The full backend enum — if the backend adds a status, this list (and the
// Record-typed STATUS_META) must grow, or these tests / the compiler fail.
const ALL_STATUSES: DeliveryStatus[] = [
  'SCHEDULED',
  'PENDING',
  'CONFIRMED',
  'DRONE_ASSIGNED',
  'PICKUP_IN_PROGRESS',
  'IN_TRANSIT',
  'AWAITING_HANDOFF',
  'DELIVERED',
  'CANCELED',
  'RETURNING',
  'DELIVERY_FAILED',
  'RETURNED_TO_BASE',
];

const ALL_REASONS: DeliveryFailureReason[] = [
  'RECIPIENT_UNAVAILABLE',
  'WEATHER_ABORT',
  'UNSAFE_DROP_ZONE',
  'MECHANICAL',
  'ADMIN_ABORT',
  'OTHER',
];

describe('deliveryStatus', () => {
  it('has meta for EVERY backend status (no fallback, real label + colors)', () => {
    for (const s of ALL_STATUSES) {
      const m = statusMeta(s);
      expect(m.label).not.toBe('Unknown');
      expect(m.label.length).toBeGreaterThan(0);
      expect(m.color).toMatch(/^#/);
      expect(m.bg).toMatch(/^#/);
      expect(m.progressPct).toBeGreaterThanOrEqual(0);
      expect(m.progressPct).toBeLessThanOrEqual(100);
    }
    // STATUS_META covers exactly the known statuses.
    expect(Object.keys(STATUS_META).sort()).toEqual([...ALL_STATUSES].sort());
  });

  it('falls back safely for an unrecognized status', () => {
    expect(statusMeta('SOMETHING_NEW').label).toBe('Unknown');
    expect(statusMeta(null).label).toBe('Unknown');
    expect(statusMeta(undefined).label).toBe('Unknown');
  });

  it('marks the right statuses terminal (polling-stop signal)', () => {
    const terminal = ALL_STATUSES.filter((s) => statusMeta(s).terminal);
    expect(terminal.sort()).toEqual(
      ['CANCELED', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNED_TO_BASE'].sort(),
    );
    // RETURNING is transient — the drone is still flying home, keep polling.
    expect(statusMeta('RETURNING').terminal).toBe(false);
    expect(statusMeta('AWAITING_HANDOFF').terminal).toBe(false);
  });

  it('marks the exception branches (which carry a failureReason)', () => {
    const exceptions = ALL_STATUSES.filter((s) => statusMeta(s).exception);
    expect(exceptions.sort()).toEqual(
      ['DELIVERY_FAILED', 'RETURNED_TO_BASE', 'RETURNING'].sort(),
    );
  });

  it('progress increases monotonically along the happy path', () => {
    const order: DeliveryStatus[] = [
      'PENDING',
      'CONFIRMED',
      'DRONE_ASSIGNED',
      'PICKUP_IN_PROGRESS',
      'IN_TRANSIT',
      'AWAITING_HANDOFF',
      'DELIVERED',
    ];
    for (let i = 1; i < order.length; i++) {
      expect(statusMeta(order[i]).progressPct).toBeGreaterThan(
        statusMeta(order[i - 1]).progressPct,
      );
    }
  });

  it('maps every failure reason to a non-empty message; null → null', () => {
    for (const r of ALL_REASONS) {
      expect(failureReasonMessage(r)).toBeTruthy();
    }
    expect(failureReasonMessage(null)).toBeNull();
    expect(failureReasonMessage(undefined)).toBeNull();
  });
});
