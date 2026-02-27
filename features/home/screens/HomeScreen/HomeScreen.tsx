import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BackHandler } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, colors, commonStyles } from "../../../../styles/common";
import { HeaderSection } from "./components/HeaderSection";
import { QuickActions } from "./components/QuickActions";
import { ActiveDeliveries } from "./components/ActiveDeliveries";
import { PromoCard } from "./components/PromoCard";
import { RecentDeliveries } from "./components/RecentDeliveries";
import { MapCard } from "./components/MapCard";
import type { Delivery, RecentItem, QuickAction } from "./HomeScreen.types";

// ==================== DATA ====================
const quickActions: QuickAction[] = [
  { label: "New Delivery", icon: "add", tone: ["#14B8A6", "#06B6D4"] },
  { label: "Scan QR", icon: "qr-code", tone: ["#6366F1", "#0EA5E9"] },
  { label: "Track Package", icon: "local-shipping", tone: ["#10B981", "#84CC16"] },
  { label: "Price Estimate", icon: "payments", tone: ["#F59E0B", "#F97316"] },
];

const activeDeliveries: Delivery[] = [
  { id: "11324572", title: "Hamburger & Fries", status: "In Progress", progress: 45, eta: "11:00 AM" },
  { id: "11324578", title: "Protein Shakes", status: "Picked up", progress: 20, eta: "Today" },
];

const recentDeliveries: RecentItem[] = [
  { id: "11324573", title: "Aspirin (Healthcare)", sub: "Delivered 10:42" },
  { id: "11324574", title: "Fresh Vegetables", sub: "Delivered Yesterday" },
  { id: "11324577", title: "Books & Stationery", sub: "Delivered 2d ago" },
];

// ==================== COMPONENT ====================
export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userName = "Sena";

  // Handle hardware back button - exit app on home screen (root tab)
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      BackHandler.exitApp();
      return true;
    });
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
        <PromoCard code="FLYFAST" description="Free delivery for your next order" />
        <RecentDeliveries items={recentDeliveries} />
        <MapCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
});
