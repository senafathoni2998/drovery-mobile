import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Shared animation configuration
const headerAnim = FadeIn.duration(500).springify();
const tabsAnim = FadeInDown.delay(100).duration(500).springify();
const listAnim = FadeInDown.delay(200).duration(500).springify();

// Types
type DeliveryStatus = "current" | "completed" | "canceled";

type DeliveryItem = {
  id: string;
  title: string;
  status: DeliveryStatus;
  subtitle?: string;
};

// Mock Data
const ITEMS: DeliveryItem[] = [
  {
    id: "11324572",
    title: "Hamburger & Fries",
    status: "current",
    subtitle: "ETA 11:00 AM",
  },
  {
    id: "11324573",
    title: "Aspirin (Healthcare)",
    status: "completed",
    subtitle: "Delivered 10:42 AM",
  },
  {
    id: "11324574",
    title: "Fresh Vegetables",
    status: "completed",
    subtitle: "Delivered Yesterday",
  },
  {
    id: "11324575",
    title: "Laptop Parcel",
    status: "current",
    subtitle: "On the way",
  },
  {
    id: "11324576",
    title: "Office Documents",
    status: "canceled",
    subtitle: "Canceled by sender",
  },
  {
    id: "11324577",
    title: "Books & Stationery",
    status: "completed",
    subtitle: "Delivered 2 days ago",
  },
  {
    id: "11324578",
    title: "Protein Shakes",
    status: "current",
    subtitle: "Picked up 10 mins ago",
  },
];

type SortOption = "recent" | "title" | "status";

// Status Chip Component
interface StatusChipProps {
  status: DeliveryStatus;
}

function StatusChip({ status }: StatusChipProps) {
  const config = {
    completed: {
      icon: "checkmark-circle" as const,
      label: "Completed",
      bg: "#ECFDF5",
      color: "#047857",
      border: "#A7F3D0",
    },
    canceled: {
      icon: "close-circle" as const,
      label: "Canceled",
      bg: "#FEF2F2",
      color: "#B91C1C",
      border: "#FECACA",
    },
    current: {
      icon: "time" as const,
      label: "In Progress",
      bg: "#E0F2FE",
      color: "#0369A1",
      border: "#BAE6FD",
    },
  };

  const { icon, label, bg, color, border } = config[status];

  return (
    <View style={[styles.statusChip, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.statusChipText, { color }]}>{label}</Text>
    </View>
  );
}

// Delivery Card Component
interface DeliveryCardProps {
  item: DeliveryItem;
}

function DeliveryCard({ item }: DeliveryCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.deliveryCard}
      onPress={() => router.push("/delivery-detail")}
    >
      <View style={styles.deliveryCardHeader}>
        <View style={styles.deliveryIconContainer}>
          <MaterialIcons name="inventory-2" size={24} color="#0D9488" />
        </View>
        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryTitleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.deliverySubtitle} numberOfLines={1}>
                id: {item.id}
              </Text>
              {item.subtitle && (
                <Text style={styles.deliverySubtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.deliveryRight}>
          <StatusChip status={item.status} />
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Sort Dropdown
interface SortDropdownProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

function SortDropdown({ sortBy, onSortChange }: SortDropdownProps) {
  const [visible, setVisible] = useState(false);

  const options: { key: SortOption; label: string }[] = [
    { key: "recent", label: "Sort by Recent" },
    { key: "title", label: "Sort by Title (A-Z)" },
    { key: "status", label: "Sort by Status" },
  ];

  return (
    <View style={styles.sortContainer}>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setVisible(!visible)}
      >
        <Ionicons name="options" size={20} color="#fff" />
      </TouchableOpacity>

      {visible && (
        <View style={styles.sortDropdown}>
          <View style={styles.sortDropdownArrow} />
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                sortBy === option.key && styles.sortOptionActive,
              ]}
              onPress={() => {
                onSortChange(option.key);
                setVisible(false);
              }}
            >
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === option.key && styles.sortOptionTextActive,
                ]}
              >
                {option.label}
              </Text>
              {sortBy === option.key && (
                <Ionicons name="checkmark" size={16} color="#0D9488" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<DeliveryStatus>("current");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const filtered = useMemo(() => {
    const base = ITEMS.filter((i) => i.status === tab);
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
  }, [tab, query, sortBy]);

  const tabs: { key: DeliveryStatus; label: string }[] = [
    { key: "current", label: "Current Delivery" },
    { key: "completed", label: "Completed" },
    { key: "canceled", label: "Canceled" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={headerAnim}>
          <LinearGradient
            colors={["#14B8A6", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <Text style={styles.headerTitle}>Delivery</Text>
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search by title or id"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.headerBlur} />
          </LinearGradient>
        </Animated.View>

        {/* Tabs */}
        <Animated.View entering={tabsAnim} style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {tabs.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key)}
                style={[
                  styles.tabButton,
                  tab === t.key && styles.tabButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    tab === t.key && styles.tabButtonTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* List */}
        <Animated.View entering={listAnim} style={styles.listContainer}>
          {filtered.map((item) => (
            <DeliveryCard key={item.id} item={item} />
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No deliveries found</Text>
              <Text style={styles.emptyStateText}>
                Try changing your filter or search query
              </Text>
            </View>
          )}
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Header
  header: {
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  headerBlur: {
    position: "absolute",
    right: -48,
    top: -48,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },
  // Sort Dropdown
  sortContainer: {
    position: "relative",
  },
  sortButton: {
    padding: 8,
  },
  sortDropdown: {
    position: "absolute",
    right: 0,
    top: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 180,
    zIndex: 100,
  },
  sortDropdownArrow: {
    position: "absolute",
    right: 12,
    top: -6,
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    transform: [{ rotate: "45deg" }],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#E2E8F0",
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sortOptionActive: {
    backgroundColor: "#F0FDFA",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#475569",
  },
  sortOptionTextActive: {
    color: "#0D9488",
    fontWeight: "500",
  },
  // Tabs
  tabsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tabsScroll: {
    gap: 8,
  },
  tabButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabButtonActive: {
    backgroundColor: "#CCFBF1",
    borderColor: "#99F6E4",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  tabButtonTextActive: {
    color: "#0F766E",
  },
  // List
  listContainer: {
    paddingHorizontal: 8,
    marginTop: 12,
    gap: 8,
  },
  deliveryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deliveryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deliveryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  deliverySubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  deliveryRight: {
    alignItems: "center",
    gap: 8,
  },
  // Status Chip
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  // Empty State
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 48,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
