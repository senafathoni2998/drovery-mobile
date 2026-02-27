import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { spacing, borderRadius, colors } from "../../../../../styles/common";

interface PromoCardProps {
  code: string;
  description: string;
}

export function PromoCard({ code, description }: PromoCardProps) {
  const handleClaim = () => {
    // TODO: Implement promo claim logic
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.promoSection}>
      <View style={styles.promoCard}>
        <View style={styles.promoBlur} />
        <View style={styles.promoContent}>
          <View style={styles.promoIconContainer}>
            <Ionicons name="gift" size={24} color="#D97706" />
          </View>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>{description}</Text>
            <Text style={styles.promoSubtitle}>
              Use code <Text style={styles.promoCode}>{code}</Text> • valid today only
            </Text>
          </View>
          <TouchableOpacity style={styles.claimButton} onPress={handleClaim}>
            <LinearGradient
              colors={["#14B8A6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.claimGradient}
            >
              <Text style={styles.claimText}>Claim</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  promoSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  promoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  promoBlur: {
    position: "absolute",
    right: -32,
    top: -32,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(20, 184, 166, 0.15)",
  },
  promoContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  promoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: "#FEF3C7",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  promoSubtitle: {
    fontSize: 12,
    color: colors.text.light,
  },
  promoCode: {
    fontWeight: "600",
    color: colors.text.primary,
  },
  claimButton: {
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  claimGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  claimText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
});
