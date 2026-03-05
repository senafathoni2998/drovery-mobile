import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  BounceIn,
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";

export function CongratulatoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();

  const params = useLocalSearchParams<{
    orderId: string;
    from: string;
    to: string;
    pickupDate: string;
    estTime: string;
    price: string;
  }>();

  // Pulsing ring animation around the success icon
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.4);

  useEffect(() => {
    ringScale.value = withDelay(
      600,
      withRepeat(
        withSequence(withTiming(1.35, { duration: 900 }), withTiming(1, { duration: 900 })),
        -1,
        true,
      ),
    );
    ringOpacity.value = withDelay(
      600,
      withRepeat(
        withSequence(withTiming(0, { duration: 900 }), withTiming(0.4, { duration: 900 })),
        -1,
        true,
      ),
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const handleTrackDelivery = () => {
    router.dismissAll();
    setTimeout(() => router.push("/delivery-detail"), 50);
  };

  const handleBackToHome = () => {
    router.dismissAll();
  };

  return (
    <View style={s.root}>
      {/* ── GRADIENT TOP ── */}
      <LinearGradient
        colors={["#0D9488", "#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.hero, { paddingTop: insets.top + spacing.xl }]}
      >
        {/* Decorative blobs */}
        <View style={s.blobTopRight} />
        <View style={s.blobBottomLeft} />
        <View style={s.blobMid} />

        {/* Pulsing ring + success icon */}
        <View style={s.iconWrapper}>
          <Animated.View style={[s.ring, ringStyle]} />
          <Animated.View entering={BounceIn.delay(200).duration(700)} style={s.iconCircle}>
            <Ionicons name="checkmark" size={48} color={colors.primary.DEFAULT} />
          </Animated.View>
        </View>

        {/* Heading */}
        <Animated.Text entering={FadeInUp.delay(400).duration(500)} style={s.heading}>
          Congratulations!
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(500).duration(500)} style={s.subheading}>
          Your delivery has been confirmed{"\n"}and is now being processed.
        </Animated.Text>

        {/* Order badge */}
        <Animated.View entering={FadeInUp.delay(600).duration(500)} style={s.orderBadge}>
          <MaterialIcons name="tag" size={13} color={colors.white} />
          <Text style={s.orderBadgeText}>{params.orderId ?? "DRV-00000"}</Text>
        </Animated.View>
      </LinearGradient>

      {/* ── WHITE CARD ── */}
      <Animated.View
        entering={FadeInUp.delay(300).duration(500)}
        style={s.card}
      >
        {/* Route summary */}
        <View style={s.routeRow}>
          <View style={s.routePoint}>
            <View style={[s.routeDot, { backgroundColor: colors.primary.DEFAULT }]} />
            <Text style={s.routeLabel}>From</Text>
            <Text style={s.routeValue} numberOfLines={2}>{params.from ?? "—"}</Text>
          </View>

          <View style={s.routeArrow}>
            <View style={s.routeLine} />
            <MaterialIcons name="flight-takeoff" size={20} color={colors.primary.DEFAULT} />
            <View style={s.routeLine} />
          </View>

          <View style={[s.routePoint, { alignItems: "flex-end" }]}>
            <View style={[s.routeDot, { backgroundColor: "#F43F5E" }]} />
            <Text style={s.routeLabel}>To</Text>
            <Text style={[s.routeValue, { textAlign: "right" }]} numberOfLines={2}>
              {params.to ?? "—"}
            </Text>
          </View>
        </View>

        {/* Delivery info pills */}
        <View style={s.infoRow}>
          <View style={s.infoPill}>
            <MaterialIcons name="calendar-month" size={14} color={colors.primary.DEFAULT} />
            <Text style={s.infoPillText}>{params.pickupDate ?? "—"}</Text>
          </View>
          <View style={s.infoPill}>
            <MaterialIcons name="schedule" size={14} color={colors.warning} />
            <Text style={s.infoPillText}>Est. {params.estTime ?? "—"}</Text>
          </View>
          <View style={s.infoPill}>
            <MaterialIcons name="payments" size={14} color={colors.success} />
            <Text style={s.infoPillText}>${params.price ?? "0"}</Text>
          </View>
        </View>

        <View style={s.divider} />

        {/* Buttons */}
        <TouchableOpacity
          style={s.primaryBtn}
          onPress={handleTrackDelivery}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#14B8A6", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.primaryBtnGradient}
          >
            <MaterialIcons name="local-shipping" size={18} color={colors.white} />
            <Text style={s.primaryBtnText}>Track Delivery</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={handleBackToHome}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={18} color={colors.primary.DEFAULT} />
          <Text style={s.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* bottom safe area fill */}
      <View style={[s.bottomFill, { height: insets.bottom }]} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  // Hero gradient
  hero: {
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingBottom: 64,
    overflow: "hidden",
  },
  blobTopRight: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  blobBottomLeft: {
    position: "absolute",
    bottom: -24,
    left: -24,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  blobMid: {
    position: "absolute",
    top: 40,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  // Success icon
  iconWrapper: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  ring: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  // Text
  heading: {
    fontSize: fontSize["4xl"],
    fontWeight: "800",
    color: colors.white,
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  subheading: {
    fontSize: fontSize.base,
    color: "rgba(255,255,255,0.82)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  orderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  orderBadgeText: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.5,
  },
  // Card
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    marginTop: -28,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  // Route row
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  routePoint: {
    flex: 1,
    gap: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  routeLabel: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.text.placeholder,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  routeValue: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.primary,
    lineHeight: 20,
  },
  routeArrow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.DEFAULT,
  },
  // Info pills
  infoRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: "wrap",
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  infoPillText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.lg,
  },
  // Buttons
  primaryBtn: {
    height: 52,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  primaryBtnGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primaryBtnText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.white,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "#F0FDFA",
  },
  secondaryBtnText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  bottomFill: {
    backgroundColor: colors.white,
  },
});
