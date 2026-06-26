import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { useNotificationPreferences } from "@/features/notifications/hooks/useNotificationPreferences";

type ToggleKey = "pushEnabled" | "deliveryUpdates" | "promotions";

const ROWS: { key: ToggleKey; title: string; subtitle: string }[] = [
  {
    key: "pushEnabled",
    title: "Push notifications",
    subtitle: "Allow Drovery to send push alerts to this device",
  },
  {
    key: "deliveryUpdates",
    title: "Delivery updates",
    subtitle: "Status changes, handoff, and arrival alerts",
  },
  {
    key: "promotions",
    title: "Promotions & offers",
    subtitle: "Discounts, referral rewards, and news",
  },
];

export function NotificationSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, update } = useNotificationPreferences();

  const onToggle = async (key: ToggleKey, value: boolean) => {
    try {
      await update({ [key]: value });
    } catch (e) {
      Alert.alert(
        "Couldn't save",
        e instanceof Error ? e.message : "Please try again.",
      );
    }
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notification Settings</Text>
        <View style={s.headerDecor} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading && !data ? (
          <ActivityIndicator
            size="large"
            color={colors.primary.DEFAULT}
            style={{ marginTop: spacing.xxxl }}
          />
        ) : !data ? (
          <Text style={s.errorText}>
            {error ?? "Couldn't load your notification preferences."}
          </Text>
        ) : (
          <View style={s.card}>
            {ROWS.map((row, index) => (
              <Animated.View
                key={row.key}
                entering={FadeInDown.delay(index * 60).duration(400)}
              >
                <View style={s.row}>
                  <View style={s.rowText}>
                    <Text style={s.rowTitle}>{row.title}</Text>
                    <Text style={s.rowSubtitle}>{row.subtitle}</Text>
                  </View>
                  <Switch
                    value={!!data[row.key]}
                    onValueChange={(v) => onToggle(row.key, v)}
                    trackColor={{ true: colors.primary.DEFAULT, false: "#CBD5E1" }}
                    thumbColor={colors.white}
                  />
                </View>
                {index < ROWS.length - 1 && <View style={s.divider} />}
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    overflow: "hidden",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.xxl,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.white,
    marginLeft: spacing.md,
  },
  headerDecor: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  scrollContent: { padding: spacing.lg },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.text.placeholder,
    textAlign: "center",
    marginTop: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  rowText: { flex: 1 },
  rowTitle: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.primary,
  },
  rowSubtitle: {
    fontSize: fontSize.xs,
    color: colors.text.placeholder,
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: colors.border.light },
});
