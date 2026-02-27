import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { spacing, colors } from "../../../../../styles/common";

interface InfoItemProps {
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap;
  iconType: "Material" | "Ion";
  label: string;
  value: string;
  subValue?: string;
  color: string;
}

export function InfoItem({ icon, iconType, label, value, subValue, color }: InfoItemProps) {
  return (
    <View style={styles.item}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        {iconType === "Material" ? (
          <MaterialIcons name={icon as any} size={20} color={color} />
        ) : (
          <Ionicons name={icon as any} size={20} color={color} />
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  subValue: {
    fontSize: 12,
    color: colors.text.light,
    marginTop: spacing.xs,
  },
});
