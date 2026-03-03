import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { spacing, borderRadius, colors, fontSize } from "@/styles/common";
import type { PackageType } from "../CreateDeliveryScreen.types";

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
        return (
          <TouchableOpacity
            key={type.id}
            style={[styles.option, isSelected && styles.optionActive]}
            onPress={() => onSelect(type.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isSelected && styles.iconContainerActive]}>
              <MaterialIcons
                name={type.icon}
                size={20}
                color={isSelected ? colors.white : colors.text.light}
              />
            </View>
            <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
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
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
  },
  option: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.white,
    minWidth: 100,
  },
  optionActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border.light,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  iconContainerActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  optionTextActive: {
    color: colors.white,
  },
});
