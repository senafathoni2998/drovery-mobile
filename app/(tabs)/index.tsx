import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
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
const quickAnim = FadeInDown.delay(100).duration(500).springify();
const sectionAnim = FadeInDown.delay(200).duration(500).springify();

interface Delivery {
  id: string;
  title: string;
  status: string;
  progress: number;
  eta: string;
}

interface RecentItem {
  id: string;
  title: string;
  sub: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userName = "Sena";

  const quickActions = [
    {
      label: "New Delivery",
      icon: "add" as const,
      tone: ["#14B8A6", "#06B6D4"],
    },
    {
      label: "Scan QR",
      icon: "qr-code" as const,
      tone: ["#6366F1", "#0EA5E9"],
    },
    {
      label: "Track Package",
      icon: "local-shipping" as const,
      tone: ["#10B981", "#84CC16"],
    },
    {
      label: "Price Estimate",
      icon: "payments" as const,
      tone: ["#F59E0B", "#F97316"],
    },
  ];

  const activeDeliveries: Delivery[] = [
    {
      id: "11324572",
      title: "Hamburger & Fries",
      status: "In Progress",
      progress: 45,
      eta: "11:00 AM",
    },
    {
      id: "11324578",
      title: "Protein Shakes",
      status: "Picked up",
      progress: 20,
      eta: "Today",
    },
  ];

  const recent: RecentItem[] = [
    { id: "11324573", title: "Aspirin (Healthcare)", sub: "Delivered 10:42" },
    { id: "11324574", title: "Fresh Vegetables", sub: "Delivered Yesterday" },
    { id: "11324577", title: "Books & Stationery", sub: "Delivered 2d ago" },
  ];

  const QuickActionButton = ({
    label,
    icon,
    tone,
  }: {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    tone: string[];
  }) => (
    <TouchableOpacity style={styles.quickButton}>
      <LinearGradient
        colors={tone}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickButtonGradient}
      >
        <View style={styles.quickIconContainer}>
          <MaterialIcons name={icon} size={20} color="#fff" />
        </View>
        <Text style={styles.quickButtonText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const DeliveryCard = ({ delivery }: { delivery: Delivery }) => (
    <TouchableOpacity style={styles.deliveryCard}>
      <View style={styles.deliveryCardHeader}>
        <View style={styles.deliveryIconContainer}>
          <MaterialIcons name="local-shipping" size={24} color="#0D9488" />
        </View>
        <View style={styles.deliveryInfo}>
          <View style={styles.deliveryTitleRow}>
            <Text style={styles.deliveryTitle} numberOfLines={1}>
              {delivery.title}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{delivery.status}</Text>
            </View>
          </View>
          <Text style={styles.deliverySubtitle} numberOfLines={1}>
            id: {delivery.id} • ETA {delivery.eta}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${delivery.progress}%` },
            ]}
          >
            <LinearGradient
              colors={["#14B8A6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const RecentCard = ({ item }: { item: RecentItem }) => (
    <View style={styles.recentCard}>
      <View style={styles.recentIconContainer}>
        <MaterialIcons name="inventory-2" size={20} color="#64748B" />
      </View>
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.recentSubtitle} numberOfLines={1}>
          id: {item.id}
        </Text>
        <Text style={styles.recentSub} numberOfLines={1}>
          {item.sub}
        </Text>
      </View>
    </View>
  );

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
              <View style={styles.headerUser}>
                <View style={styles.headerIconContainer}>
                  <MaterialIcons name="inventory-2" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.headerGreeting}>Good day,</Text>
                  <Text style={styles.headerName}>{userName}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Location */}
            <View style={styles.locationBar}>
              <Ionicons name="location" size={16} color="#fff" />
              <Text style={styles.locationText}>Set location • Jakarta</Text>
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search deliveries, IDs, addresses"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.headerBlur} />
          </LinearGradient>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={quickAnim} style={styles.quickSection}>
          <View style={styles.quickGrid}>
            {quickActions.map((action) => (
              <QuickActionButton
                key={action.label}
                label={action.label}
                icon={action.icon}
                tone={action.tone}
              />
            ))}
          </View>
        </Animated.View>

        {/* Active Deliveries */}
        <Animated.View entering={sectionAnim} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active deliveries</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.deliveriesList}>
            {activeDeliveries.map((delivery) => (
              <DeliveryCard key={delivery.id} delivery={delivery} />
            ))}
          </View>
        </Animated.View>

        {/* Promo Card */}
        <Animated.View entering={sectionAnim} style={styles.promoSection}>
          <View style={styles.promoCard}>
            <View style={styles.promoBlur} />
            <View style={styles.promoContent}>
              <View style={styles.promoIconContainer}>
                <Ionicons name="gift" size={24} color="#D97706" />
              </View>
              <View style={styles.promoTextContainer}>
                <Text style={styles.promoTitle}>
                  Free delivery for your next order
                </Text>
                <Text style={styles.promoSubtitle}>
                  Use code <Text style={styles.promoCode}>FLYFAST</Text> • valid today only
                </Text>
              </View>
              <TouchableOpacity style={styles.claimButton}>
                <LinearGradient
                  colors={["#14B8A6", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.claimGradient}
                >
                  <Text style={styles.claimText}>Claim</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Recent Deliveries */}
        <Animated.View entering={sectionAnim} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent deliveries</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See history</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentScroll}
          >
            {recent.map((item) => (
              <RecentCard key={item.id} item={item} />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Nearby Drop Points */}
        <Animated.View entering={sectionAnim} style={styles.section}>
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <View style={styles.mapTitleRow}>
                <Ionicons name="navigate" size={20} color="#0D9488" />
                <Text style={styles.mapTitle}>Nearby drop points</Text>
              </View>
              <TouchableOpacity style={styles.mapButton}>
                <Text style={styles.mapButtonText}>Open Map</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapPlaceholder}>
              <LinearGradient
                colors={["#F1F5F9", "#E2E8F0"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mapPlaceholderGradient}
              >
                <Ionicons name="map-outline" size={40} color="#94A3B8" />
              </LinearGradient>
            </View>
          </View>
        </Animated.View>

        {/* Bottom padding for tab bar */}
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
    paddingBottom: 16,
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
  headerUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  headerGreeting: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  notificationButton: {
    padding: 4,
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.95)",
  },
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
  headerBlur: {
    position: "absolute",
    right: -48,
    top: -48,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  // Quick Actions
  quickSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 8,
  },
  quickButton: {
    flex: 1,
    aspectRatio: 1,
  },
  quickButtonGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 4,
  },
  quickButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  // Section
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  seeAllText: {
    fontSize: 14,
    color: "#0D9488",
    fontWeight: "500",
  },
  // Delivery Cards
  deliveriesList: {
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0369A1",
  },
  deliverySubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressGradient: {
    flex: 1,
  },
  // Promo Card
  promoSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  promoCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  promoBlur: {
    position: "absolute",
    right: -32,
    top: -32,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(20, 184, 166, 0.15)",
  },
  promoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  promoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  promoSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  promoCode: {
    fontWeight: "600",
    color: "#1E293B",
  },
  claimButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  claimGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  claimText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  // Recent
  recentScroll: {
    gap: 12,
  },
  recentCard: {
    width: 240,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
    marginBottom: 2,
  },
  recentSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  recentSub: {
    fontSize: 12,
    color: "#64748B",
  },
  // Map Card
  mapCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  mapTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  mapButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  mapPlaceholder: {
    height: 144,
  },
  mapPlaceholderGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
