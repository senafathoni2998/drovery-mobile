import { MaterialIcons } from "@expo/vector-icons";

export interface Delivery {
  id: string;         // trackingId — displayed to user
  deliveryId: string; // database UUID — used for API/navigation
  title: string;
  status: string;
  progress: number;
  eta: string;
}

export interface RecentItem {
  id: string;         // trackingId — displayed to user
  deliveryId: string; // database UUID — used for API/navigation
  title: string;
  sub: string;
}

export interface QuickAction {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone: readonly [string, string];
}
