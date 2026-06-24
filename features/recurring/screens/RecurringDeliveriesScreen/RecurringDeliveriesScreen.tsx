import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRecurringDeliveries } from "@/features/recurring/hooks/useRecurringDeliveries";
import type { RecurringDelivery } from "@/features/recurring/services/recurringApi";

// ── Helpers ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatCadence(item: RecurringDelivery): string {
  if (item.freq === "WEEKLY") {
    const days = [...item.daysOfWeek]
      .sort((a, b) => a - b)
      .map((d) => DAY_LABELS[d] ?? "")
      .filter(Boolean)
      .join(", ");
    return `Weekly · ${days || "—"} · ${item.timeOfDay}`;
  }
  return `Daily · ${item.timeOfDay}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RecurringDeliveriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch, pause, resume, remove } =
    useRecurringDeliveries();

  const handleToggle = async (item: RecurringDelivery) => {
    try {
      if (item.active) {
        await pause(item.id);
      } else {
        await resume(item.id);
      }
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.message ??
          `Failed to ${item.active ? "pause" : "resume"} this schedule`,
      );
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Schedule",
      "Are you sure you want to delete this recurring delivery? This stops all future deliveries.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(id);
            } catch {
              Alert.alert("Error", "Failed to delete this schedule");
            }
          },
        },
      ],
    );
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
        <Text style={s.headerTitle}>Recurring Deliveries</Text>
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
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={s.emptyState}
          >
            <MaterialIcons
              name="error-outline"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>Couldn&apos;t load schedules</Text>
            <Text style={s.emptySubtitle}>{error}</Text>
            <TouchableOpacity style={s.retryButton} onPress={refetch}>
              <MaterialIcons
                name="refresh"
                size={18}
                color={colors.primary.DEFAULT}
              />
              <Text style={s.retryText}>Try again</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : data.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={s.emptyState}
          >
            <MaterialIcons
              name="event-repeat"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>No recurring deliveries</Text>
            <Text style={s.emptySubtitle}>
              Scheduled deliveries you set up will appear here
            </Text>
          </Animated.View>
        ) : (
          data.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(index * 80).duration(400)}
            >
              <RecurringCard
                item={item}
                onToggle={() => handleToggle(item)}
                onDelete={() => handleDelete(item.id)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ── RecurringCard ─────────────────────────────────────────────────────────────

function RecurringCard({
  item,
  onToggle,
  onDelete,
}: {
  item: RecurringDelivery;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.cardWrapper}>
      <View style={s.card}>
        <View style={s.cardIcon}>
          <MaterialIcons
            name="event-repeat"
            size={22}
            color={colors.primary.DEFAULT}
          />
        </View>
        <View style={s.cardBody}>
          <View style={s.cardTop}>
            <Text style={s.cardReceiver} numberOfLines={1}>
              {item.receiver}
            </Text>
            <View
              style={[
                s.statusBadge,
                item.active ? s.statusBadgeActive : s.statusBadgePaused,
              ]}
            >
              <Text
                style={[
                  s.statusBadgeText,
                  item.active
                    ? s.statusBadgeTextActive
                    : s.statusBadgeTextPaused,
                ]}
              >
                {item.active ? "ACTIVE" : "PAUSED"}
              </Text>
            </View>
          </View>

          {/* Route summary */}
          <View style={s.routeRow}>
            <MaterialIcons
              name="trip-origin"
              size={14}
              color={colors.text.light}
            />
            <Text style={s.routeText} numberOfLines={1}>
              {item.fromAddress}
            </Text>
          </View>
          <View style={s.routeRow}>
            <MaterialIcons name="place" size={14} color={colors.primary.DEFAULT} />
            <Text style={s.routeText} numberOfLines={1}>
              {item.toAddress}
            </Text>
          </View>

          {/* Cadence */}
          <View style={s.cadenceRow}>
            <MaterialIcons
              name="schedule"
              size={14}
              color={colors.text.placeholder}
            />
            <Text style={s.cadenceText}>{formatCadence(item)}</Text>
          </View>
        </View>
      </View>

      <View style={s.cardActions}>
        <TouchableOpacity style={s.actionButton} onPress={onToggle}>
          <MaterialIcons
            name={item.active ? "pause-circle-outline" : "play-circle-outline"}
            size={18}
            color={colors.primary.DEFAULT}
          />
          <Text style={[s.actionText, { color: colors.primary.DEFAULT }]}>
            {item.active ? "Pause" : "Resume"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionButton, s.actionButtonDelete]}
          onPress={onDelete}
        >
          <MaterialIcons name="delete-outline" size={18} color={colors.error} />
          <Text style={[s.actionText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
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
  cardWrapper: {
    gap: spacing.xs,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  cardReceiver: {
    flexShrink: 1,
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
  statusBadgeActive: {
    backgroundColor: "#CCFBF1",
    borderColor: "#99F6E4",
  },
  statusBadgePaused: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  statusBadgeTextActive: {
    color: colors.primary.dark,
  },
  statusBadgeTextPaused: {
    color: "#B45309",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  routeText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.light,
  },
  cadenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  cadenceText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text.muted,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  actionButtonDelete: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF5F5",
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
});
