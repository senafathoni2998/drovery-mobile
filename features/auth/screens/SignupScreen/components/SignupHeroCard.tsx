import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { styles, colors, spacing, borderRadius } from "@/features/auth/screens/LoginScreen/LoginScreen.styles";

interface SignupHeroCardProps {
  entering: typeof FadeInDown;
}

export function SignupHeroCard({ entering }: SignupHeroCardProps) {
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
            <Ionicons name="person-add" size={28} color="#fff" />
          </View>
          <View>
            <Text style={styles.heroTitle}>Create account</Text>
            <Text style={styles.heroSubtitle}>Sign up to get started</Text>
          </View>
        </View>
        <View style={styles.heroBlur} />
      </LinearGradient>
    </Animated.View>
  );
}
