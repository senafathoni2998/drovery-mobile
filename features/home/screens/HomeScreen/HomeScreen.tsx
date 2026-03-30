import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { BackHandler, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveDeliveries } from "../../hooks/useActiveDeliveries";
import { useRecentDeliveries } from "../../hooks/useRecentDeliveries";
import { commonStyles, spacing } from "../../../../styles/common";
import { ActiveDeliveries } from "./components/ActiveDeliveries";
import { HeaderSection } from "./components/HeaderSection";
import { QuickActions } from "./components/QuickActions";
import { RecentDeliveries } from "./components/RecentDeliveries";
import type { Delivery, QuickAction, RecentItem } from "./HomeScreen.types";

// ==================== DATA ====================
const quickActions: QuickAction[] = [
  { label: "New Delivery", icon: "add-circle", tone: ["#14B8A6", "#06B6D4"] },
  { label: "Load/Unload", icon: "inventory", tone: ["#6366F1", "#0EA5E9"] },
  {
    label: "Track Package",
    icon: "local-shipping",
    tone: ["#10B981", "#84CC16"],
  },
  { label: "Price Estimate", icon: "payments", tone: ["#F59E0B", "#F97316"] },
] as const;

function getStatusProgress(status: string): number {
  const map: Record<string, number> = {
    PENDING: 10,
    CONFIRMED: 20,
    DRONE_ASSIGNED: 35,
    PICKUP_IN_PROGRESS: 50,
    IN_TRANSIT: 75,
    DELIVERED: 100,
    CANCELED: 0,
  };
  return map[status] ?? 0;
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ==================== COMPONENT ====================
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.name ?? "User";
  const { data: activeData, refetch: refetchActive } = useActiveDeliveries();
  const { data: recentData, refetch: refetchRecent } = useRecentDeliveries();

  // Reload data every time this tab gets focus
  useFocusEffect(useCallback(() => {
    refetchActive();
    refetchRecent();
  }, [refetchActive, refetchRecent]));

  const activeDeliveries: Delivery[] = activeData.map((d) => ({
    id: d.trackingId,
    deliveryId: d.id,
    title: d.packages,
    status: formatStatus(d.status),
    progress: getStatusProgress(d.status),
    eta: d.pickupTime || "Pending",
  }));

  const recentDeliveries: RecentItem[] = recentData.map((d) => ({
    id: d.trackingId,
    deliveryId: d.id,
    title: d.packages,
    sub: `Delivered ${new Date(d.updatedAt).toLocaleDateString()}`,
  }));

  // Handle hardware back button - exit app on home screen (root tab)
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp();
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeaderSection userName={userName} />
        <QuickActions actions={quickActions} />
        <ActiveDeliveries deliveries={activeDeliveries} />
        {/* <PromoCard code="FLYFAST" description="Free delivery for your next order" /> */}
        <RecentDeliveries items={recentDeliveries} />
        {/* <MapCard /> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
});
