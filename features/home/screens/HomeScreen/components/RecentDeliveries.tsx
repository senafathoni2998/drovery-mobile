import React from "react";
import { StyleSheet, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { spacing, borderRadius, colors } from "@/styles/common";
import type { RecentItem } from "../HomeScreen.types";

interface RecentDeliveriesProps {
  items: RecentItem[];
}

export function RecentDeliveries({ items }: RecentDeliveriesProps) {
  const router = useRouter();

  const RecentCard = ({ item }: { item: RecentItem }) => (
    <TouchableOpacity
      style={styles.recentCard}
      onPress={() => router.push("/delivery-detail")}
    >
      <View style={styles.recentIconContainer}>
        <MaterialIcons name="inventory-2" size={20} color={colors.text.light} />
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
    </TouchableOpacity>
  );

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent deliveries</Text>
        <TouchableOpacity onPress={() => router.push("/orders?tab=completed")}>
          <Text style={styles.seeAllText}>See history</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentScroll}
      >
        {items.map((item) => (
          <RecentCard key={item.id} item={item} />
        ))}
      </ScrollView>
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
  recentScroll: {
    gap: spacing.md,
  },
  recentCard: {
    width: 240,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.md,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.border.light,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recentSubtitle: {
    fontSize: 12,
    color: colors.text.light,
  },
  recentSub: {
    fontSize: 12,
    color: colors.text.light,
  },
});
