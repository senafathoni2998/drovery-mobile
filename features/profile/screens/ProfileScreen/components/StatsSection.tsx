import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, colors } from "../../../../../styles/common";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
}

export function StatsSection() {
  return (
    <View style={styles.container}>
      <StatCard icon="cube" iconColor={colors.primary.DEFAULT} label="Total Orders" value="24" />
      <StatCard icon="checkmark-circle" iconColor={colors.success} label="Completed" value="22" />
    </View>
  );
}

function StatCard({ icon, iconColor, label, value }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={24} color={iconColor} />
      <View style={styles.info}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  card: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
  },
  label: {
    fontSize: 12,
    color: colors.text.light,
  },
});
