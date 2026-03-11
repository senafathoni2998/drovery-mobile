import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  borderRadius,
  colors,
  commonStyles,
  spacing,
} from "../../../../styles/common";

// ==================== MOCK DATA ====================
const RECENT_TRACKS = [
  {
    id: "124213152",
    pkg: "Aspirin (Healthcare)",
    from: "Jl. Padjajaran Raya No. 21",
    to: "Jl. Otto Iskandar Dinata No.21",
    status: "On Progress",
    statusColor: "#0D9488",
    statusBg: "#F0FDFA",
  },
  {
    id: "983741023",
    pkg: "Electronics Package",
    from: "Jl. Sudirman No. 5",
    to: "Jl. Gatot Subroto No. 12",
    status: "Delivered",
    statusColor: "#047857",
    statusBg: "#ECFDF5",
  },
  {
    id: "567812390",
    pkg: "Document (Legal)",
    from: "Jl. Diponegoro No. 88",
    to: "Jl. Ahmad Yani No. 33",
    status: "Pickup Scheduled",
    statusColor: "#0369A1",
    statusBg: "#E0F2FE",
  },
];

// ==================== MAIN COMPONENT ====================
export function TrackPackageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleTrack = () => {
    if (!trackingId.trim()) return;
    router.push("/delivery-detail");
  };

  const handleRecentTrack = () => {
    router.push("/delivery-detail");
  };

  const handleScanQR = () => {
    router.push("/qr-scanner");
  };

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerDecorTL} />
        <View style={styles.headerDecorBR} />

        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Track Package</Text>
          <View style={styles.backButton} />
        </View>

        <Text style={styles.headerSubtitle}>
          Enter your tracking ID to get real-time updates on your delivery.
        </Text>

        {/* Search bar */}
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <MaterialIcons name="search" size={20} color={isFocused ? colors.primary.DEFAULT : "#94A3B8"} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter tracking ID (e.g. 124213152)"
            placeholderTextColor="#94A3B8"
            value={trackingId}
            onChangeText={setTrackingId}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="number-pad"
            returnKeyType="search"
            onSubmitEditing={handleTrack}
          />
          {trackingId.length > 0 && (
            <TouchableOpacity onPress={() => setTrackingId("")}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Action buttons */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.actionsRow}>
          <TouchableOpacity style={styles.trackButton} onPress={handleTrack} activeOpacity={0.85}>
            <LinearGradient
              colors={["#14B8A6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.trackButtonGradient}
            >
              <MaterialIcons name="gps-fixed" size={18} color="#fff" />
              <Text style={styles.trackButtonText}>Track Package</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.scanButton} onPress={handleScanQR} activeOpacity={0.85}>
            <MaterialIcons name="qr-code-scanner" size={20} color={colors.primary.DEFAULT} />
            <Text style={styles.scanButtonText}>Scan QR</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Tips card */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <View style={styles.tipCard}>
            <View style={styles.tipIconWrap}>
              <MaterialIcons name="info-outline" size={18} color="#0369A1" />
            </View>
            <Text style={styles.tipText}>
              You can find your tracking ID in the delivery confirmation SMS or email.
            </Text>
          </View>
        </Animated.View>

        {/* Recent tracks */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tracks</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.recentList}>
            {RECENT_TRACKS.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(250 + index * 60).springify()}>
                <TouchableOpacity
                  style={styles.recentCard}
                  onPress={handleRecentTrack}
                  activeOpacity={0.85}
                >
                  <View style={styles.recentCardLeft}>
                    <LinearGradient
                      colors={["#14B8A6", "#06B6D4"]}
                      style={styles.recentIconBg}
                    >
                      <MaterialIcons name="inventory-2" size={16} color="#fff" />
                    </LinearGradient>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentPkg} numberOfLines={1}>{item.pkg}</Text>
                      <View style={styles.recentRoute}>
                        <MaterialIcons name="trip-origin" size={10} color="#0D9488" />
                        <Text style={styles.recentRouteText} numberOfLines={1}>{item.from}</Text>
                      </View>
                      <View style={styles.recentRoute}>
                        <MaterialIcons name="location-on" size={10} color="#F43F5E" />
                        <Text style={styles.recentRouteText} numberOfLines={1}>{item.to}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.recentCardRight}>
                    <View style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
                      <Text style={[styles.statusText, { color: item.statusColor }]}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={styles.recentId}>#{item.id}</Text>
                    <Ionicons name="chevron-forward" size={14} color="#CBD5E1" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl + spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  headerDecorTL: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerDecorBR: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#fff",
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchBarFocused: {
    borderColor: colors.primary.DEFAULT,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  trackButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trackButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 14,
  },
  trackButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: "#F0FDFA",
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#EFF6FF",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: "#1D4ED8",
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary.DEFAULT,
  },
  recentList: {
    gap: spacing.md,
  },
  recentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  recentCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  recentIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  recentInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  recentPkg: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text.primary,
  },
  recentRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  recentRouteText: {
    fontSize: 11,
    color: colors.text.light,
    flex: 1,
  },
  recentCardRight: {
    alignItems: "flex-end",
    gap: spacing.xs,
    flexShrink: 0,
    marginLeft: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  recentId: {
    fontSize: 10,
    color: colors.text.placeholder,
    fontWeight: "500",
  },
});
