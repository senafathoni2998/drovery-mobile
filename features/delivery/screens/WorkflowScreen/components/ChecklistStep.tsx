import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing } from "@/styles/common";
import type { ChecklistStepData } from "../../../workflow/types";

interface Props {
  step: ChecklistStepData;
  onReady: (ready: boolean) => void;
}

export function ChecklistStep({ step, onReady }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    onReady(step.items.every((item) => next[item.id]));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{step.instruction}</Text>
      <View style={styles.items}>
        {step.items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, isChecked && styles.itemChecked]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                {isChecked && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={[styles.itemLabel, isChecked && styles.itemLabelChecked]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  instruction: {
    fontSize: 14,
    color: colors.text.light,
    lineHeight: 22,
  },
  items: {
    gap: spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  itemChecked: {
    borderColor: colors.success,
    backgroundColor: "#F0FDF4",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border.focus,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  itemLabelChecked: {
    color: "#166534",
  },
});
