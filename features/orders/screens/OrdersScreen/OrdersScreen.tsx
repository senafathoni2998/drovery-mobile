import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { commonStyles, colors, spacing } from "../../../../styles/common";
import { useDeliveries } from "../../hooks/useDeliveries";
import { DeliveryCard } from "./components/DeliveryCard";
import { EmptyState } from "./components/EmptyState";
import { OrdersHeader } from "./components/OrdersHeader";
import { Tabs } from "./components/Tabs";
import {
  TABS,
  type DeliveryItem,
  type DeliveryStatus,
  type SortOption,
} from "./OrdersScreen.types";

// ==================== MAIN COMPONENT ====================
export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: DeliveryStatus }>();

  // State
  const [activeTab, setActiveTab] = useState<DeliveryStatus>("current");

  // Set active tab from URL param
  useEffect(() => {
    if (params.tab && ["current", "completed", "canceled"].includes(params.tab)) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortVisible, setSortVisible] = useState(false);

  const { items, loading, refetch } = useDeliveries({
    status: activeTab,
    q: query || undefined,
    sort: sortBy,
  });

  // Reload data when tab gets focus
  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const filteredItems: DeliveryItem[] = items.map((d) => ({
    id: d.trackingId,
    deliveryId: d.id,
    title: d.packages,
    status: activeTab,
    subtitle:
      d.status === "DELIVERED"
        ? `Delivered ${new Date(d.updatedAt).toLocaleDateString()}`
        : d.status === "CANCELED"
          ? "Canceled"
          : `ETA: ${d.pickupTime || "Pending"}`,
  }));

  // Handlers
  const handleSortSelect = (option: string) => {
    setSortBy(option as SortOption);
    setSortVisible(false);
  };

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500).springify()}>
          <LinearGradient
            colors={["#14B8A6", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={commonStyles.gradientHeader}
          >
            <OrdersHeader
              query={query}
              sortBy={sortBy}
              sortVisible={sortVisible}
              onQueryChange={setQuery}
              onToggleSort={() => setSortVisible(!sortVisible)}
              onSelectSort={handleSortSelect}
            />
          </LinearGradient>
        </Animated.View>

        {/* Tabs */}
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* List */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500).springify()}
          style={styles.listContainer}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} style={{ marginTop: 40 }} />
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <DeliveryCard key={item.id} item={item} />
            ))
          ) : (
            <EmptyState
              title="No deliveries found"
              message="Try changing your filter or search query"
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 100,
  },
  listContainer: {
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
