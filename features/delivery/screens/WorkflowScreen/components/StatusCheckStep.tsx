import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing } from "@/styles/common";
import type { StatusCheckStepData } from "../../../workflow/types";

interface Props {
  step: StatusCheckStepData;
}

export function StatusCheckStep({ step }: Props) {
  const { indicator } = step;

  return (
    <View style={styles.container}>
      {/* LED visual */}
      <View style={styles.ledWrapper}>
        <View style={[styles.ledGlow, { backgroundColor: `${indicator.color}20` }]}>
          <View style={[styles.ledInner, { backgroundColor: `${indicator.color}40` }]}>
            <View style={[styles.led, { backgroundColor: indicator.color }]}>
              <View style={styles.ledShine} />
            </View>
          </View>
        </View>
      </View>

      {/* Status label */}
      <View style={[styles.statusBadge, { borderColor: `${indicator.color}60`, backgroundColor: `${indicator.color}12` }]}>
        <Ionicons name="radio-button-on" size={14} color={indicator.color} />
        <Text style={[styles.statusLabel, { color: indicator.color }]}>{indicator.label}</Text>
      </View>

      <Text style={styles.statusDesc}>{indicator.description}</Text>

      <Text style={styles.instruction}>{step.instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.xl,
  },
  ledWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  ledGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  ledInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  led: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: 8,
  },
  ledShine: {
    width: 10,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.5)",
    transform: [{ rotate: "30deg" }],
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusDesc: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.muted,
  },
  instruction: {
    fontSize: 14,
    color: colors.text.light,
    lineHeight: 24,
    textAlign: "center",
  },
});
