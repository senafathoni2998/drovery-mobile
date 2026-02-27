import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { statusBadge } from "../../../../../styles/common";
import type { DeliveryStatus } from "../OrdersScreen.types";

interface StatusChipProps {
  status: DeliveryStatus;
}

export function StatusChip({ status }: StatusChipProps) {
  const config = statusBadge(status === "current" ? "in-progress" : status);

  return (
    <View style={[styles.chip, { backgroundColor: config.bg, borderColor: config.border }]}>
      <Ionicons name={config.icon} size={14} color={config.color} />
      <Text style={[styles.chipText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
