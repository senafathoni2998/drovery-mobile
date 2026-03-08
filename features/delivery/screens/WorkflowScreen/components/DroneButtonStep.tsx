import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing } from "@/styles/common";
import type { DroneButtonStepData } from "../../../workflow/types";

interface Props {
  step: DroneButtonStepData;
}

export function DroneButtonStep({ step }: Props) {
  return (
    <View style={styles.container}>
      {/* Animated ring visual for the physical button */}
      <View style={styles.ringOuter}>
        <View style={styles.ringMiddle}>
          <View style={styles.buttonCircle}>
            <Ionicons name={step.icon as any} size={36} color={colors.primary.DEFAULT} />
          </View>
        </View>
      </View>

      <View style={styles.labelRow}>
        <Ionicons name="hand-right-outline" size={18} color={colors.warning} />
        <Text style={styles.label}>Physical drone button</Text>
      </View>

      <Text style={styles.instruction}>{step.instruction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.xxl,
  },
  ringOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${colors.primary.DEFAULT}10`,
    justifyContent: "center",
    alignItems: "center",
  },
  ringMiddle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: `${colors.primary.DEFAULT}18`,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#C2410C",
  },
  instruction: {
    fontSize: 14,
    color: colors.text.light,
    lineHeight: 24,
    textAlign: "center",
  },
});
