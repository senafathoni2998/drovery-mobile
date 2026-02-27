import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { spacing, borderRadius, colors, commonStyles } from "@/styles/common";
import type { DeliveryStatus } from "../OrdersScreen.types";

interface TabsProps {
  tabs: { key: DeliveryStatus; label: string }[];
  activeTab: DeliveryStatus;
  onTabChange: (tab: DeliveryStatus) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  scroll: {
    gap: spacing.sm,
  },
  tabButton: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  tabButtonActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[100],
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.light,
  },
  tabButtonTextActive: {
    color: colors.primary[700],
  },
});
