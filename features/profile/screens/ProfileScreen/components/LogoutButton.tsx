import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, colors } from "../../../../../styles/common";

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
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
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
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
  },
});
