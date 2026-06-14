import type {
  DeliveryStatus as ApiDeliveryStatus,
  DeliveryFailureReason,
} from "@/services/api/types";

// Tab keys = the server-side list filter (distinct from a per-delivery status).
export type TabKey = "current" | "completed" | "canceled";
// Back-compat alias: existing imports use DeliveryStatus to mean the tab key.
export type DeliveryStatus = TabKey;

export type DeliveryItem = {
  id: string;       // trackingId — displayed to user
  deliveryId: string; // database UUID — used for API calls
  title: string;
  // The REAL per-delivery status (drives the chip via statusMeta) — NOT the tab.
  status: ApiDeliveryStatus;
  failureReason?: DeliveryFailureReason | null;
  subtitle?: string;
};

export type SortOption = "recent" | "title" | "status";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "current", label: "Current Delivery" },
  { key: "completed", label: "Completed" },
  { key: "canceled", label: "Canceled" },
];
