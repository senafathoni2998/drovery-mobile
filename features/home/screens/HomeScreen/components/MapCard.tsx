import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, borderRadius, colors } from "../../../../../styles/common";

export function MapCard() {
  const handleOpenMap = () => {
    // TODO: Implement map opening logic
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.section}>
      <View style={styles.mapCard}>
        <View style={styles.mapHeader}>
          <View style={styles.mapTitleRow}>
            <Ionicons name="navigate" size={20} color={colors.primary.DEFAULT} />
            <Text style={styles.mapTitle}>Nearby drop points</Text>
          </View>
          <TouchableOpacity style={styles.mapButton} onPress={handleOpenMap}>
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
            <Ionicons name="map-outline" size={40} color={colors.text.placeholder} />
          </LinearGradient>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  mapCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  mapHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    padding: spacing.lg,
  },
  mapTitleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  mapButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.focus,
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.text.muted,
  },
  mapPlaceholder: {
    height: 144,
  },
  mapPlaceholderGradient: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
});
