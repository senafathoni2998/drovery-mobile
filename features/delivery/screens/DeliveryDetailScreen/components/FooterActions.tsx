import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, borderRadius, colors } from "@/styles/common";

interface FooterActionsProps {
  onTrackMap?: () => void;
  onContactSupport?: () => void;
}

export function FooterActions({ onTrackMap, onContactSupport }: FooterActionsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.primaryButton} onPress={onTrackMap}>
        <LinearGradient
          colors={["#14B8A6", "#06B6D4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          <Ionicons name="map" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Track on Map</Text>
        </LinearGradient>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={onContactSupport}>
        <Ionicons name="chatbubble-outline" size={18} color={colors.text.light} />
        <Text style={styles.secondaryButtonText}>Contact Support</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: 24,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: spacing.sm,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.focus,
    backgroundColor: colors.white,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.light,
  },
});
