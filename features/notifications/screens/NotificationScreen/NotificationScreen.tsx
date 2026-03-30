import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  borderRadius,
  colors,
  commonStyles,
  fontSize,
  spacing,
} from "@/styles/common";
import { useNotifications } from "../../hooks/useNotifications";
import type { ApiNotification } from "@/services/api/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function NotificationItem({
  item,
  onPress,
}: {
  item: ApiNotification;
  onPress: (id: string) => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.notifCard, !item.read && styles.notifCardUnread]}
      onPress={() => onPress(item.id)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: item.read ? "#F1F5F9" : "#CCFBF1" },
        ]}
      >
        <Ionicons
          name="notifications"
          size={20}
          color={item.read ? colors.text.light : colors.primary.DEFAULT}
        />
      </View>
      <View style={styles.notifContent}>
        <View style={styles.notifHeader}>
          <Text
            style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.notifTime}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={styles.notifBody} numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, loading, refetch, markAsRead, markAllAsRead } =
    useNotifications();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const unreadCount = data.filter((n) => !n.read).length;

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(500).springify()}>
        <LinearGradient
          colors={["#14B8A6", "#06B6D4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={commonStyles.gradientHeader}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={commonStyles.iconContainerSm}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 ? (
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.markAllBtn}
              >
                <Text style={styles.markAllText}>Read all</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 60 }} />
            )}
          </View>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </Text>
          )}
          <View style={styles.headerBlur} />
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary.DEFAULT}
          style={{ marginTop: 60 }}
        />
      ) : data.length === 0 ? (
        <Animated.View
          entering={FadeInDown.delay(200).duration(500).springify()}
          style={styles.emptyContainer}
        >
          <View style={styles.emptyIcon}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={colors.text.placeholder}
            />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyMessage}>
            You'll see delivery updates and alerts here
          </Text>
        </Animated.View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(200).duration(500).springify()}
            style={styles.listWrapper}
          >
            {data.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onPress={markAsRead}
              />
            ))}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  headerSub: {
    fontSize: fontSize.md,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: spacing.sm,
  },
  markAllBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: borderRadius.sm,
  },
  markAllText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: "#fff",
  },
  headerBlur: {
    position: "absolute",
    right: -48,
    top: -48,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  // List
  listContent: {
    paddingBottom: 100,
  },
  listWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },

  // Notification Card
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardUnread: {
    backgroundColor: "#F0FDFA",
    borderColor: "#CCFBF1",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  notifContent: {
    flex: 1,
  },
  notifHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.text.secondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  notifTitleUnread: {
    fontWeight: "700",
    color: colors.text.primary,
  },
  notifTime: {
    fontSize: fontSize.xs,
    color: colors.text.light,
  },
  notifBody: {
    fontSize: fontSize.md,
    color: colors.text.muted,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
    marginLeft: spacing.sm,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    marginTop: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize["2xl"],
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: fontSize.base,
    color: colors.text.light,
    textAlign: "center",
  },
});
