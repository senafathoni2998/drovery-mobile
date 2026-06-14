import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { statusMeta, type DeliveryStatusKind } from "@/services/deliveryStatus";
import type { DeliveryStatus } from "@/services/api/types";

interface StatusChipProps {
  status: DeliveryStatus;
}

const KIND_ICON: Record<DeliveryStatusKind, keyof typeof Ionicons.glyphMap> = {
  pending: "time-outline",
  active: "navigate-outline",
  awaiting: "hand-left-outline",
  success: "checkmark-circle",
  canceled: "close-circle",
  returning: "return-up-back",
  failed: "alert-circle",
  returned: "home",
};

export function StatusChip({ status }: StatusChipProps) {
  const meta = statusMeta(status);

  return (
    <View style={[styles.chip, { backgroundColor: meta.bg, borderColor: meta.color }]}>
      <Ionicons name={KIND_ICON[meta.kind]} size={14} color={meta.color} />
      <Text style={[styles.chipText, { color: meta.color }]}>{meta.label}</Text>
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
