import {
  isStatusChange,
  mergeTrackingUpdate,
} from '@/features/delivery/services/deliveryTrackingMerge';
import type { ApiDelivery } from '@/services/api/types';

const BASE: ApiDelivery = {
  id: 'del-1',
  trackingId: 'TRK-001',
  userId: 'usr-1',
  status: 'IN_TRANSIT',
  failureReason: null,
  fromAddress: 'A',
  toAddress: 'B',
  fromLat: -6.2,
  fromLng: 106.8,
  toLat: -6.3,
  toLng: 106.9,
  receiver: 'John',
  packages: 'Box',
  packageSize: 'Medium',
  packageWeight: 2,
  packageTypes: [],
  pickupDate: '2024-06-01',
  pickupTime: '10:00 AM',
  estimatedDelivery: '12:00 PM',
  estimatedPrice: 15,
  createdAt: '2024-06-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
  tracking: {
    id: 'trk-1',
    deliveryId: 'del-1',
    droneLat: -6.25,
    droneLng: 106.85,
    droneStatus: 'in_flight',
    routeJson: null,
    eta: '11:45 AM',
  },
};

describe('mergeTrackingUpdate', () => {
  it('drops a frame when there is no base delivery yet', () => {
    expect(mergeTrackingUpdate(null, { deliveryId: 'del-1', droneLat: 1 })).toBeNull();
  });

  it('patches position in place, preserving droneStatus / eta / status', () => {
    const next = mergeTrackingUpdate(BASE, {
      deliveryId: 'del-1',
      droneLat: -6.4,
      droneLng: 106.95,
    });
    expect(next).not.toBe(BASE); // new object
    expect(next!.tracking!.droneLat).toBe(-6.4);
    expect(next!.tracking!.droneLng).toBe(106.95);
    expect(next!.tracking!.droneStatus).toBe('in_flight'); // preserved
    expect(next!.tracking!.eta).toBe('11:45 AM'); // preserved
    expect(next!.status).toBe('IN_TRANSIT'); // preserved
  });

  it('honors a zero coordinate (undefined-check, not truthiness)', () => {
    const next = mergeTrackingUpdate(BASE, { deliveryId: 'del-1', droneLat: 0 });
    expect(next!.tracking!.droneLat).toBe(0);
    expect(next!.tracking!.droneLng).toBe(106.85); // untouched
  });

  it('patches droneStatus only', () => {
    const next = mergeTrackingUpdate(BASE, {
      deliveryId: 'del-1',
      droneStatus: 'descending',
    });
    expect(next!.tracking!.droneStatus).toBe('descending');
    expect(next!.tracking!.droneLat).toBe(-6.25); // untouched
  });

  it('updates top-level status on a status change', () => {
    const next = mergeTrackingUpdate(BASE, {
      deliveryId: 'del-1',
      status: 'AWAITING_HANDOFF',
    });
    expect(next!.status).toBe('AWAITING_HANDOFF');
    expect(next!.tracking).toBe(BASE.tracking); // tracking untouched (no pos/droneStatus)
  });

  it('returns the same reference when nothing changed (same status, no fields)', () => {
    expect(mergeTrackingUpdate(BASE, { deliveryId: 'del-1', status: 'IN_TRANSIT' })).toBe(
      BASE,
    );
  });

  it('never writes eta / failureReason / proof from a push', () => {
    const next = mergeTrackingUpdate(BASE, {
      deliveryId: 'del-1',
      status: 'AWAITING_HANDOFF',
      droneLat: -6.4,
    });
    expect(next!.tracking!.eta).toBe('11:45 AM');
    expect(next!.failureReason).toBeNull();
  });
});

describe('isStatusChange', () => {
  it('is false when status is absent or equal, true when it differs', () => {
    expect(isStatusChange(BASE, { deliveryId: 'del-1', droneLat: 1 })).toBe(false);
    expect(isStatusChange(BASE, { deliveryId: 'del-1', status: 'IN_TRANSIT' })).toBe(false);
    expect(isStatusChange(BASE, { deliveryId: 'del-1', status: 'DELIVERED' })).toBe(true);
    expect(isStatusChange(null, { deliveryId: 'del-1', status: 'DELIVERED' })).toBe(false);
  });
});
