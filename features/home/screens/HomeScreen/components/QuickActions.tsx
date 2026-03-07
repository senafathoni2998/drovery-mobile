import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { spacing, borderRadius, colors } from "@/styles/common";
import type { QuickAction } from "../HomeScreen.types";

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const router = useRouter();

  const handleActionPress = (label: string) => {
    switch (label) {
      case "New Delivery":
        router.push("/create-delivery");
        break;
      case "Scan QR":
        // TODO: Implement QR scanner
        break;
      case "Track Package":
        // TODO: Implement package tracking
        break;
      case "Price Estimate":
        router.push("/price-estimation");
        break;
    }
  };

  const QuickActionButton = ({ label, icon, tone }: QuickAction) => (
    <TouchableOpacity style={styles.quickButton} onPress={() => handleActionPress(label)}>
      <LinearGradient
        colors={tone}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickButtonGradient}
      >
        <View style={styles.quickIconContainer}>
          <MaterialIcons name={icon} size={20} color="#fff" />
        </View>
        <Text style={styles.quickButtonText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.quickSection}>
      <View style={styles.quickGrid}>
        {actions.map((action) => (
          <QuickActionButton key={action.label} {...action} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  quickSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  quickGrid: {
    flexDirection: "row" as const,
    gap: spacing.sm,
  },
  quickButton: {
    flex: 1,
    aspectRatio: 1,
  },
  quickButtonGradient: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: spacing.xs,
  },
  quickButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.white,
    textAlign: "center",
  },
});
