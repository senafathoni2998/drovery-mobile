import { api } from '@/services/api/apiClient';

// ── Types (mirror RecurringDeliveryResponseDto / CreateRecurringDeliveryDto) ────

export type RecurrenceFreq = 'DAILY' | 'WEEKLY';

export interface RecurringDelivery {
  id: string;
  userId: string;
  freq: RecurrenceFreq;
  // Day-of-week indices (0=Sun..6=Sat). Non-empty for WEEKLY, empty for DAILY.
  daysOfWeek: number[];
  // Wall-clock time in "HH:MM" 24h format.
  timeOfDay: string;
  startDate: string;
  endDate: string | null;
  // Whether the schedule is active; false means paused.
  active: boolean;
  // Next scheduled occurrence to be materialized; null once exhausted.
  nextRunAt: string | null;
  lastMaterializedAt: string | null;
  // ID of the most recently materialized Delivery (provenance only).
  lastDeliveryId: string | null;
  fromAddress: string;
  toAddress: string;
  fromLat: number | null;
  fromLng: number | null;
  toLat: number | null;
  toLng: number | null;
  receiver: string;
  packages: string;
  packageSize: string;
  packageWeight: number;
  packageTypes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRecurringDeliveries {
  items: RecurringDelivery[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRecurringDeliveryInput {
  // ── recurrence rule ──
  freq: RecurrenceFreq;
  // Required for WEEKLY (0=Sun..6=Sat); ignored for DAILY.
  daysOfWeek?: number[];
  // "HH:MM" 24-hour.
  timeOfDay: string;
  startDate?: string;
  endDate?: string;
  // ── delivery template ──
  fromAddress: string;
  toAddress: string;
  receiver: string;
  packages: string;
  packageSize: string;
  packageWeight: number;
  packageTypes: string[];
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
}

// ── Service ─────────────────────────────────────────────────────────────────

export const recurringApi = {
  list(page = 1, limit = 20) {
    return api.get<PaginatedRecurringDeliveries>(
      `/recurring-deliveries?page=${page}&limit=${limit}`,
    );
  },

  get(id: string) {
    return api.get<RecurringDelivery>(`/recurring-deliveries/${id}`);
  },

  create(data: CreateRecurringDeliveryInput) {
    return api.post<RecurringDelivery>('/recurring-deliveries', data);
  },

  pause(id: string) {
    return api.post<RecurringDelivery>(`/recurring-deliveries/${id}/pause`);
  },

  resume(id: string) {
    return api.post<RecurringDelivery>(`/recurring-deliveries/${id}/resume`);
  },

  remove(id: string) {
    return api.delete<void>(`/recurring-deliveries/${id}`);
  },
};
