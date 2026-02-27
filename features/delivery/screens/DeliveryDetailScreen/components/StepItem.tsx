import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, colors } from "@/styles/common";
import type { Step, StepState } from "../DeliveryDetailScreen.types";

interface StepItemProps {
  step: Step;
  index: number;
  state: StepState;
}

export function StepItem({ step, index, state }: StepItemProps) {
  return (
    <View style={styles.item}>
      <View
        style={[
          styles.marker,
          state === "done" && styles.markerDone,
          state === "current" && styles.markerCurrent,
          state === "upcoming" && styles.markerUpcoming,
        ]}
      >
        {state === "done" ? (
          <Ionicons name="checkmark" size={14} color={colors.success} />
        ) : state === "current" ? (
          <View style={styles.dot} />
        ) : (
          <Ionicons name="ellipse" size={12} color={colors.border.focus} />
        )}
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            state === "done" && styles.titleDone,
            state === "current" && styles.titleCurrent,
            state === "upcoming" && styles.titleUpcoming,
          ]}
        >
          {step.title}
        </Text>
        <Text style={styles.desc}>{step.desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row" as const,
    paddingLeft: 32,
    position: "relative",
  },
  marker: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    backgroundColor: colors.white,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 1,
  },
  markerDone: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  markerCurrent: {
    borderColor: "#0EA5E9",
  },
  markerUpcoming: {
    borderColor: colors.border.focus,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: borderRadius.xl,
    backgroundColor: "#0EA5E9",
  },
  content: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  titleDone: {
    color: "#047857",
  },
  titleCurrent: {
    color: "#0369A1",
  },
  titleUpcoming: {
    color: colors.text.placeholder,
  },
  desc: {
    fontSize: 13,
    color: colors.text.light,
    lineHeight: 18,
  },
});
