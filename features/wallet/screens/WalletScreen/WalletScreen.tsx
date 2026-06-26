import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWallet } from "@/features/wallet/hooks/useWallet";
import type {
  WalletTransaction,
  WalletTxnReason,
} from "@/features/wallet/services/walletApi";

// ── Helpers ───────────────────────────────────────────────────────────────────

const REASON_LABEL: Record<WalletTxnReason, string> = {
  REFERRAL_REWARD: "Referral reward",
  REFEREE_REWARD: "Welcome reward",
  CHECKOUT_SPEND: "Delivery payment",
  CHECKOUT_REFUND: "Delivery refund",
};

const REASON_ICON: Record<WalletTxnReason, keyof typeof MaterialIcons.glyphMap> = {
  REFERRAL_REWARD: "card-giftcard",
  REFEREE_REWARD: "redeem",
  CHECKOUT_SPEND: "local-shipping",
  CHECKOUT_REFUND: "undo",
};

function reasonLabel(reason: WalletTxnReason): string {
  return REASON_LABEL[reason] ?? "Transaction";
}

function reasonIcon(reason: WalletTxnReason): keyof typeof MaterialIcons.glyphMap {
  return REASON_ICON[reason] ?? "swap-horiz";
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatAmount(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  return `${amount.toFixed(2)} ${code}`;
}

// Trigger load-more a little before the very bottom for a smoother feel.
const END_THRESHOLD = 120;

// ── Component ─────────────────────────────────────────────────────────────────

export function WalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    balance,
    currency,
    transactions,
    loading,
    loadingMore,
    error,
    loadMore,
    hasMore,
  } = useWallet();

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);
    if (distanceFromBottom <= END_THRESHOLD) {
      loadMore();
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
        <Text style={s.headerTitle}>Wallet</Text>
        <View style={s.headerDecor} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        {/* ── Balance card ── */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={["#0D9488", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.balanceCard}
          >
            <View style={s.balanceTop}>
              <Text style={s.balanceLabel}>Available Credits</Text>
              <View style={s.walletIcon}>
                <Ionicons name="wallet" size={18} color={colors.white} />
              </View>
            </View>
            <View style={s.balanceRow}>
              <Text style={s.balanceValue}>{balance.toFixed(2)}</Text>
              <Text style={s.balanceCurrency}>{currency.toUpperCase()}</Text>
            </View>
            <Text style={s.balanceHint}>
              Credits are applied automatically at checkout
            </Text>
            <View style={s.balanceDecor} />
          </LinearGradient>
        </Animated.View>

        {/* ── Ledger ── */}
        <Text style={s.sectionTitle}>Transactions</Text>

        {loading ? (
          <View style={s.centered}>
            <ActivityIndicator color={colors.primary.DEFAULT} />
          </View>
        ) : error ? (
          <Animated.View entering={FadeInDown.duration(400)} style={s.emptyState}>
            <MaterialIcons
              name="error-outline"
              size={48}
              color={colors.error}
            />
            <Text style={s.emptyTitle}>Couldn’t load wallet</Text>
            <Text style={s.emptySubtitle}>{error}</Text>
          </Animated.View>
        ) : transactions.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={s.emptyState}>
            <MaterialIcons
              name="receipt-long"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>No transactions yet</Text>
            <Text style={s.emptySubtitle}>
              Your credit activity will appear here
            </Text>
          </Animated.View>
        ) : (
          <View style={s.ledger}>
            {transactions.map((txn, index) => (
              <Animated.View
                key={txn.id}
                entering={FadeInRight.delay(Math.min(index, 8) * 60).duration(400)}
              >
                <TransactionRow txn={txn} currency={currency} />
              </Animated.View>
            ))}

            {loadingMore && (
              <View style={s.footerLoader}>
                <ActivityIndicator color={colors.primary.DEFAULT} />
              </View>
            )}
            {!hasMore && transactions.length > 0 && (
              <Text style={s.endNote}>That’s everything</Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── TransactionRow ──────────────────────────────────────────────────────────────

function TransactionRow({
  txn,
  currency,
}: {
  txn: WalletTransaction;
  currency: string;
}) {
  const isCredit = txn.type === "CREDIT";
  const sign = isCredit ? "+" : "−";
  const amountColor = isCredit ? colors.success : colors.text.primary;
  const iconBg = isCredit ? "#ECFDF5" : "#F1F5F9";
  const iconColor = isCredit ? colors.success : colors.text.muted;

  return (
    <View style={s.row}>
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
        <MaterialIcons name={reasonIcon(txn.reason)} size={20} color={iconColor} />
      </View>
      <View style={s.rowBody}>
        <Text style={s.rowLabel} numberOfLines={1}>
          {reasonLabel(txn.reason)}
        </Text>
        <Text style={s.rowDate}>{relativeDate(txn.createdAt)}</Text>
      </View>
      <View style={s.rowAmounts}>
        <Text style={[s.rowAmount, { color: amountColor }]}>
          {sign}
          {formatAmount(txn.amount, currency)}
        </Text>
        <Text style={s.rowBalance}>
          Bal {formatAmount(txn.balanceAfter, currency)}
        </Text>
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
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  // Balance card
  balanceCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  balanceValue: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 0.5,
  },
  balanceCurrency: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 6,
  },
  balanceHint: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.75)",
  },
  balanceDecor: {
    position: "absolute",
    right: -50,
    bottom: -50,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  // Section
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text.primary,
    marginTop: spacing.sm,
  },
  centered: {
    paddingVertical: spacing.xxxl,
    alignItems: "center",
  },
  // Empty / error
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
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
  // Ledger
  ledger: {
    gap: spacing.sm,
  },
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
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.primary,
  },
  rowDate: {
    fontSize: fontSize.md,
    color: colors.text.light,
  },
  rowAmounts: {
    alignItems: "flex-end",
    gap: 2,
  },
  rowAmount: {
    fontSize: fontSize.base,
    fontWeight: "700",
  },
  rowBalance: {
    fontSize: fontSize.xs,
    color: colors.text.placeholder,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  endNote: {
    textAlign: "center",
    fontSize: fontSize.md,
    color: colors.text.placeholder,
    paddingVertical: spacing.md,
  },
});
