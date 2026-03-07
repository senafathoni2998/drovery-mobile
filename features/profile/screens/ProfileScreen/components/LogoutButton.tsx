import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, colors } from "@/styles/common";

interface LogoutButtonProps {
  onPress: () => void;
}

export function LogoutButton({ onPress }: LogoutButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="log-out" size={22} color={colors.error} />
      </View>
      <Text style={styles.text}>Log Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: "#FEF2F2",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  text: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.error,
  },
});
