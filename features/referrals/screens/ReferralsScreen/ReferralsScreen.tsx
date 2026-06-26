import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useReferrals } from "@/features/referrals/hooks/useReferrals";
import type { ReferralItem, ReferralStatus } from "@/features/referrals/services/referralApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  ReferralStatus,
  { label: string; bg: string; color: string; border: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  PENDING: {
    label: "Pending",
    bg: "#FFFBEB",
    color: "#B45309",
    border: "#FDE68A",
    icon: "time-outline",
  },
  REWARDED: {
    label: "Rewarded",
    bg: "#ECFDF5",
    color: "#047857",
    border: "#A7F3D0",
    icon: "checkmark-circle-outline",
  },
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ReferralsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useReferrals();

  const handleShare = async () => {
    if (!data) return;
    const reward = formatMoney(data.rewardPerReferral.referee, data.rewardPerReferral.currency);
    try {
      await Share.share({
        message:
          `Join me on Drovery and get ${reward} off your first delivery! ` +
          `Use my referral code: ${data.referralCode}`,
      });
    } catch {
      // User dismissed the share sheet — nothing to do.
    }
  };

  const handleCopy = async () => {
    if (!data) return;
    // expo-clipboard isn't installed, so fall back to the native share sheet
    // (which offers "Copy" alongside other targets) for the bare code.
    try {
      await Share.share({ message: data.referralCode });
    } catch {
      // Dismissed — ignore.
    }
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Refer & Earn</Text>
        <View style={s.headerDecor} />
      </LinearGradient>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      ) : error || !data ? (
        <View style={s.center}>
          <MaterialIcons name="error-outline" size={48} color={colors.text.placeholder} />
          <Text style={s.emptyTitle}>Couldn&apos;t load referrals</Text>
          <Text style={s.emptySubtitle}>{error ?? "Something went wrong"}</Text>
          <TouchableOpacity style={s.retryButton} onPress={refetch} activeOpacity={0.85}>
            <MaterialIcons name="refresh" size={18} color={colors.primary.DEFAULT} />
            <Text style={s.retryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            s.scrollContent,
            { paddingBottom: insets.bottom + spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Referral code card ── */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <LinearGradient
              colors={["#0F766E", "#14B8A6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={s.codeCard}
            >
              <View style={s.codeCardDecor} />
              <Text style={s.codeLabel}>YOUR REFERRAL CODE</Text>
              <TouchableOpacity
                style={s.codeRow}
                onPress={handleCopy}
                activeOpacity={0.8}
              >
                <Text style={s.codeValue}>{data.referralCode}</Text>
                <Ionicons name="copy-outline" size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={s.shareButton} onPress={handleShare} activeOpacity={0.85}>
                <Ionicons name="share-social-outline" size={18} color={colors.primary.DEFAULT} />
                <Text style={s.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>

          {/* ── Reward explainer ── */}
          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={s.rewardCard}>
            <View style={s.rewardIcon}>
              <MaterialIcons name="card-giftcard" size={22} color={colors.primary.DEFAULT} />
            </View>
            <View style={s.rewardTextWrap}>
              <Text style={s.rewardTitle}>
                Give{" "}
                {formatMoney(data.rewardPerReferral.referee, data.rewardPerReferral.currency)}, get{" "}
                {formatMoney(data.rewardPerReferral.referrer, data.rewardPerReferral.currency)}
              </Text>
              <Text style={s.rewardSubtitle}>
                Your friend gets credit on their first delivery, and you&apos;re rewarded once they
                complete it.
              </Text>
            </View>
          </Animated.View>

          {/* ── Stats ── */}
          <Animated.View entering={FadeInDown.delay(160).duration(400)} style={s.statsRow}>
            <StatTile label="Total" value={data.stats.total} color={colors.text.primary} />
            <StatTile label="Pending" value={data.stats.pending} color={colors.warning} />
            <StatTile label="Rewarded" value={data.stats.rewarded} color={colors.success} />
          </Animated.View>

          {/* ── Referral list ── */}
          <Text style={s.sectionTitle}>Your invites</Text>
          {data.referrals.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(240).duration(400)} style={s.emptyState}>
              <MaterialIcons name="people-outline" size={48} color={colors.text.placeholder} />
              <Text style={s.emptyTitle}>No referrals yet</Text>
              <Text style={s.emptySubtitle}>
                Share your code to start earning credit for every friend who joins.
              </Text>
            </Animated.View>
          ) : (
            data.referrals.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={FadeInRight.delay(240 + index * 60).duration(400)}
              >
                <ReferralRow item={item} />
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ── StatTile ──────────────────────────────────────────────────────────────────

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={s.statTile}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── ReferralRow ───────────────────────────────────────────────────────────────

function ReferralRow({ item }: { item: ReferralItem }) {
  const meta = STATUS_META[item.status] ?? STATUS_META.PENDING;
  const name = item.refereeName?.trim() || "Invited friend";
  const initial = name.charAt(0).toUpperCase();
  const dateIso = item.status === "REWARDED" && item.rewardedAt ? item.rewardedAt : item.createdAt;
  const datePrefix = item.status === "REWARDED" && item.rewardedAt ? "Rewarded" : "Joined";

  return (
    <View style={s.row}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{initial}</Text>
      </View>
      <View style={s.rowBody}>
        <Text style={s.rowName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={s.rowDate}>
          {datePrefix} {formatDate(dateIso)}
        </Text>
      </View>
      <View style={[s.badge, { backgroundColor: meta.bg, borderColor: meta.border }]}>
        <Ionicons name={meta.icon} size={13} color={meta.color} />
        <Text style={[s.badgeText, { color: meta.color }]}>{meta.label}</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  // Code card
  codeCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  codeCardDecor: {
    position: "absolute",
    right: -30,
    bottom: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  codeLabel: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  codeValue: {
    fontSize: fontSize["3xl"],
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 3,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  shareButtonText: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: colors.primary.DEFAULT,
  },
  // Reward explainer
  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.lg,
  },
  rewardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xxl,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  rewardTextWrap: {
    flex: 1,
    gap: 2,
  },
  rewardTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text.primary,
  },
  rewardSubtitle: {
    fontSize: fontSize.md,
    color: colors.text.light,
    lineHeight: 17,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statTile: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  statValue: {
    fontSize: fontSize["3xl"],
    fontWeight: "800",
  },
  statLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text.light,
  },
  // Section
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  // Empty state
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.placeholder,
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: "#F0FDFA",
  },
  retryButtonText: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  // Referral row
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.primary.DEFAULT,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.primary,
  },
  rowDate: {
    fontSize: fontSize.sm,
    color: colors.text.light,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
});
