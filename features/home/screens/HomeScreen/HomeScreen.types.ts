import { MaterialIcons } from "@expo/vector-icons";

export interface Delivery {
  id: string;
  title: string;
  status: string;
  progress: number;
  eta: string;
}

export interface RecentItem {
  id: string;
  title: string;
  sub: string;
}

export interface QuickAction {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tone: readonly [string, string];
}
