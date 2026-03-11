import { borderRadius, colors, commonStyles, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface HeaderSectionProps {
  userName: string;
}

export function HeaderSection({ userName }: HeaderSectionProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View entering={FadeIn.duration(500).springify()}>
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerUser}>
            <View style={commonStyles.iconContainerSm}>
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

        <View style={styles.locationBar}>
          <Ionicons name="location" size={16} color="#fff" />
          <Text style={styles.locationText}>Set location • Jakarta</Text>
        </View>

        {/* Search bar */}
        {/* <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search deliveries, IDs, addresses"
            placeholderTextColor="#94A3B8"
          />
        </View> */}

        <View style={styles.headerBlur} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: spacing.md,
  },
  headerUser: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
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
    padding: spacing.xs,
  },
  locationBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  locationText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.95)",
  },
  searchBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
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
});
