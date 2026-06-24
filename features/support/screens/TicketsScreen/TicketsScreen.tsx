import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTickets } from "@/features/support/hooks/useTickets";
import type { Ticket, TicketStatus } from "@/features/support/services/ticketsApi";

// ── Status presentation ─────────────────────────────────────────────────────

const STATUS_META: Record<
  TicketStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  OPEN: { label: "Open", color: colors.info, bg: "#EFF6FF", border: "#BFDBFE" },
  IN_PROGRESS: {
    label: "In progress",
    color: colors.warning,
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  RESOLVED: {
    label: "Resolved",
    color: colors.success,
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  CLOSED: {
    label: "Closed",
    color: colors.text.light,
    bg: colors.background,
    border: colors.border.DEFAULT,
  },
};

function formatUpdated(iso: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function TicketsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useTickets();

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
        <Text style={s.headerTitle}>Support</Text>
        <View style={s.headerDecor} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.loadingState}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        ) : error ? (
          <Animated.View entering={FadeInDown.duration(400)} style={s.emptyState}>
            <MaterialIcons
              name="error-outline"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>Couldn&apos;t load tickets</Text>
            <Text style={s.emptySubtitle}>{error}</Text>
            <TouchableOpacity style={s.retryButton} onPress={refetch}>
              <MaterialIcons name="refresh" size={18} color={colors.primary.DEFAULT} />
              <Text style={s.retryText}>Try again</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : data.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={s.emptyState}>
            <MaterialIcons
              name="forum"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>No support tickets</Text>
            <Text style={s.emptySubtitle}>
              When you contact support, your conversations will appear here.
            </Text>
          </Animated.View>
        ) : (
          data.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(index * 80).duration(400)}
            >
              <TicketCard
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/support-ticket",
                    params: { ticketId: item.id },
                  })
                }
              />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ── TicketCard ────────────────────────────────────────────────────────────────

function TicketCard({ item, onPress }: { item: Ticket; onPress: () => void }) {
  const meta = STATUS_META[item.status] ?? STATUS_META.OPEN;
  const updated = formatUpdated(item.lastMessageAt ?? item.updatedAt);

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.cardIcon}>
        <MaterialIcons
          name="support-agent"
          size={22}
          color={colors.primary.DEFAULT}
        />
      </View>
      <View style={s.cardBody}>
        <View style={s.cardTop}>
          <Text style={s.cardSubject} numberOfLines={1}>
            {item.message}
          </Text>
          <View
            style={[
              s.statusBadge,
              { backgroundColor: meta.bg, borderColor: meta.border },
            ]}
          >
            <Text style={[s.statusBadgeText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>
        {updated ? (
          <Text style={s.cardMeta} numberOfLines={1}>
            Updated {updated}
          </Text>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.text.placeholder} />
    </TouchableOpacity>
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
  loadingState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
  },
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
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: "#F0FDFA",
  },
  retryText: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xxl,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardSubject: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text.primary,
  },
  statusBadge: {
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  cardMeta: {
    fontSize: fontSize.sm,
    color: colors.text.light,
  },
});
