import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { styles, colors, spacing, borderRadius } from "../LoginScreen.styles";

interface HeroCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  entering: typeof FadeIn;
}

export function HeroCard({ title, subtitle, icon, entering }: HeroCardProps) {
  return (
    <Animated.View entering={entering} style={styles.heroContainer}>
      <LinearGradient
        colors={["#2DD4BF", "#22D3EE", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroContent}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.heroTitle}>{title}</Text>
            <Text style={styles.heroSubtitle}>{subtitle}</Text>
          </View>
        </View>
        <View style={styles.heroBlur} />
      </LinearGradient>
    </Animated.View>
  );
}
