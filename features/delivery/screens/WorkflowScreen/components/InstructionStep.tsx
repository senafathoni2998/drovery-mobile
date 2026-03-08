import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing } from "@/styles/common";
import type { InstructionStepData } from "../../../workflow/types";

interface Props {
  step: InstructionStepData;
}

export function InstructionStep({ step }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrapper, { backgroundColor: `${step.icon_color}18` }]}>
        <Ionicons name={step.icon as any} size={48} color={step.icon_color} />
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
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    justifyContent: "center",
    alignItems: "center",
  },
  instruction: {
    fontSize: 14,
    color: colors.text.light,
    lineHeight: 24,
    textAlign: "center",
  },
});
