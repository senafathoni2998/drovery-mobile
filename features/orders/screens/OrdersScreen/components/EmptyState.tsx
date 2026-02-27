import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, commonStyles } from "../../../../../styles/common";

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="inbox" size={48} color={colors.border.focus} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderStyle: "dashed",
    padding: 48,
    alignItems: "center" as const,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: "center",
  },
});
