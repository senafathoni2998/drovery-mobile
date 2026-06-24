import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { useFavorites } from "@/features/favorites/hooks/useFavorites";
import {
  favoriteApi,
  type Favorite,
} from "@/features/favorites/services/favoriteApi";

// ── Component ─────────────────────────────────────────────────────────────────

export function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch, remove } = useFavorites();

  // Track which favorite is currently being re-ordered to disable its button.
  const [orderingId, setOrderingId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Remove Favorite",
      "Are you sure you want to remove this saved template?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(id);
            } catch {
              Alert.alert("Error", "Failed to remove favorite");
            }
          },
        },
      ],
    );
  };

  const handleOrderAgain = async (id: string) => {
    if (orderingId) return;
    try {
      setOrderingId(id);
      const delivery = await favoriteApi.orderFromFavorite(id);
      router.push({
        pathname: "/delivery-detail",
        params: { id: delivery.id },
      });
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to place the order");
    } finally {
      setOrderingId(null);
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
        <Text style={s.headerTitle}>Favorites</Text>
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
            <Text style={s.emptyTitle}>Couldn&apos;t load favorites</Text>
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
              name="favorite-border"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>No favorites yet</Text>
            <Text style={s.emptySubtitle}>
              Save a delivery as a template to re-order it in one tap
            </Text>
          </Animated.View>
        ) : (
          data.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(index * 80).duration(400)}
            >
              <FavoriteCard
                item={item}
                ordering={orderingId === item.id}
                onOrderAgain={() => handleOrderAgain(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ── FavoriteCard ──────────────────────────────────────────────────────────────

function FavoriteCard({
  item,
  ordering,
  onOrderAgain,
  onDelete,
}: {
  item: Favorite;
  ordering: boolean;
  onOrderAgain: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.cardWrapper}>
      <View style={s.card}>
        <View style={s.cardIcon}>
          <MaterialIcons
            name="favorite"
            size={22}
            color={colors.primary.DEFAULT}
          />
        </View>
        <View style={s.cardBody}>
          <Text style={s.cardLabel} numberOfLines={1}>
            {item.label}
          </Text>

          {/* ── Route summary ── */}
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
            <MaterialIcons name="place" size={14} color={colors.error} />
            <Text style={s.routeText} numberOfLines={1}>
              {item.toAddress}
            </Text>
          </View>

          <Text style={s.cardMeta} numberOfLines={1}>
            {item.receiver} · {item.packages}
          </Text>
        </View>
      </View>

      <View style={s.cardActions}>
        <TouchableOpacity
          style={[s.actionButton, s.orderButton]}
          onPress={onOrderAgain}
          activeOpacity={0.85}
          disabled={ordering}
        >
          {ordering ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <MaterialIcons name="replay" size={18} color={colors.white} />
              <Text style={[s.actionText, { color: colors.white }]}>
                Order again
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.actionButton, s.actionButtonDelete]}
          onPress={onDelete}
          disabled={ordering}
        >
          <MaterialIcons name="delete-outline" size={18} color={colors.error} />
          <Text style={[s.actionText, { color: colors.error }]}>Remove</Text>
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
  cardLabel: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text.primary,
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  routeText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.light,
  },
  cardMeta: {
    fontSize: fontSize.sm,
    color: colors.text.placeholder,
    marginTop: spacing.xs,
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
    justifyContent: "center",
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  orderButton: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
    minWidth: 124,
  },
  actionButtonDelete: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF5F5",
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
});
