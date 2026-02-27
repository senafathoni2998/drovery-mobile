import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, borderRadius, colors } from "@/styles/common";
import { cardWithShadow } from "@/styles/common";
import type { Delivery } from "../HomeScreen.types";

interface ActiveDeliveriesProps {
  deliveries: Delivery[];
}

export function ActiveDeliveries({ deliveries }: ActiveDeliveriesProps) {
  const DeliveryCard = ({ delivery }: { delivery: Delivery }) => (
    <TouchableOpacity style={styles.deliveryCard}>
      <View style={styles.deliveryCardHeader}>
        <View style={styles.deliveryIconContainer}>
          <MaterialIcons name="local-shipping" size={24} color={colors.primary.DEFAULT} />
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
        <Ionicons name="chevron-forward" size={20} color={colors.border.focus} />
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${delivery.progress}%` }]}>
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

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active deliveries</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>View all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.deliveriesList}>
        {deliveries.map((delivery) => (
          <DeliveryCard key={delivery.id} delivery={delivery} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary.DEFAULT,
    fontWeight: "500",
  },
  deliveriesList: {
    gap: spacing.sm,
  },
  deliveryCard: {
    ...cardWithShadow("sm"),
    padding: spacing.md,
  },
  deliveryCardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  deliveryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xxl,
    backgroundColor: "#F0FDFA",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: spacing.xs,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
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
    color: colors.text.light,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.light,
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
});
