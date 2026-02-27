import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { spacing, colors, commonStyles } from "../../../../styles/common";
import { OrdersHeader } from "./components/OrdersHeader";
import { Tabs } from "./components/Tabs";
import { DeliveryCard } from "./components/DeliveryCard";
import { EmptyState } from "./components/EmptyState";
import { MOCK_ITEMS, TABS, type DeliveryItem, type DeliveryStatus, type SortOption } from "./OrdersScreen.types";

// ==================== MAIN COMPONENT ====================
export function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState<DeliveryStatus>("current");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [sortVisible, setSortVisible] = useState(false);

  // Filter and sort logic
  const filteredItems = useMemo(() => {
    const base = MOCK_ITEMS.filter((i) => i.status === activeTab);
    const q = query.trim().toLowerCase();
    const searched = q
      ? base.filter((i) => i.title.toLowerCase().includes(q) || i.id.includes(q))
      : base;
    const sorted = [...searched].sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });
    return sorted;
  }, [activeTab, query, sortBy]);

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
        <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.listContainer}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => <DeliveryCard key={item.id} item={item} />)
          ) : (
            <EmptyState title="No deliveries found" message="Try changing your filter or search query" />
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
