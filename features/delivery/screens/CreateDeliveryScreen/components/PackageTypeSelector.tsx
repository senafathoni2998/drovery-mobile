import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing, borderRadius, colors, fontSize } from "@/styles/common";
import type { PackageType } from "../CreateDeliveryScreen.types";

const ACCENT: Record<string, string> = {
  food:        "#F97316",
  document:    "#3B82F6",
  fragile:     "#8B5CF6",
  electronics: "#06B6D4",
  clothing:    "#EC4899",
  healthcare:  "#10B981",
  other:       "#64748B",
};

interface PackageTypeSelectorProps {
  types: PackageType[];
  selected: string[];
  onSelect: (typeId: string) => void;
}

export function PackageTypeSelector({ types, selected, onSelect }: PackageTypeSelectorProps) {
  return (
    <View style={styles.container}>
      {types.map((type) => {
        const isSelected = selected.includes(type.id);
        const accent = ACCENT[type.id] ?? colors.primary.DEFAULT;

        return (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.option,
              isSelected && { backgroundColor: `${accent}18`, borderColor: accent },
            ]}
            onPress={() => onSelect(type.id)}
            activeOpacity={0.7}
          >
            {/* Check badge */}
            {isSelected && (
              <View style={[styles.checkBadge, { backgroundColor: accent }]}>
                <MaterialIcons name="check" size={10} color={colors.white} />
              </View>
            )}

            {/* Icon container */}
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${accent}18` },
                isSelected && { backgroundColor: `${accent}30` },
              ]}
            >
              <MaterialIcons name={type.icon} size={22} color={accent} />
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                isSelected && { color: accent, fontWeight: "600" },
              ]}
              numberOfLines={1}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    width: "22%",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.white,
    position: "relative",
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  checkBadge: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 18,
    height: 18,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: fontSize.xs,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
  },
});
