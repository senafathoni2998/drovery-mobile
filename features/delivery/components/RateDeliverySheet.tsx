import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { useRating } from "@/features/delivery/hooks/useRating";

interface RateDeliverySheetProps {
  deliveryId: string;
  /** Called after a rating is successfully submitted. */
  onRated?: () => void;
}

const STARS = [1, 2, 3, 4, 5] as const;
const STAR_COLOR = colors.warning;
const MAX_COMMENT = 1000;

const RATING_LABEL: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent",
};

/**
 * Reusable star-rating UI for a delivery. Loads any existing rating on mount —
 * once a delivery is rated it renders read-only (the owner can still revise by
 * design on the backend, but this surface keeps the captured rating intact).
 */
export function RateDeliverySheet({ deliveryId, onRated }: RateDeliverySheetProps) {
  const { rating, loading, submitting, error, submit } = useRating(deliveryId);

  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (stars < 1 || submitting) return;
    try {
      await submit({
        stars,
        comment: comment.trim() ? comment.trim() : undefined,
      });
      onRated?.();
    } catch {
      Alert.alert("Couldn't submit", "Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={[s.card, s.centered]}>
        <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  // ── Already rated: read-only summary ──
  if (rating) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={s.card}>
        <View style={s.header}>
          <MaterialIcons name="star-rate" size={20} color={STAR_COLOR} />
          <Text style={s.title}>Your rating</Text>
        </View>

        <View style={s.starsRow}>
          {STARS.map((value) => (
            <Ionicons
              key={value}
              name={value <= rating.stars ? "star" : "star-outline"}
              size={32}
              color={value <= rating.stars ? STAR_COLOR : colors.border.focus}
              style={s.star}
            />
          ))}
        </View>

        <Text style={s.ratingLabel}>{RATING_LABEL[rating.stars]}</Text>

        {rating.comment ? (
          <View style={s.commentBox}>
            <Text style={s.commentText}>{rating.comment}</Text>
          </View>
        ) : null}

        <Text style={s.thanks}>Thanks for your feedback!</Text>
      </Animated.View>
    );
  }

  // ── Not yet rated: interactive picker ──
  const canSubmit = stars >= 1 && !submitting;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={s.card}>
      <View style={s.header}>
        <MaterialIcons name="star-rate" size={20} color={STAR_COLOR} />
        <Text style={s.title}>Rate your delivery</Text>
      </View>
      <Text style={s.helper}>
        How was your experience? Tap a star to rate.
      </Text>

      <View style={s.starsRow}>
        {STARS.map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => setStars(value)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${value} star${value > 1 ? "s" : ""}`}
            accessibilityState={{ selected: value <= stars }}
          >
            <Ionicons
              name={value <= stars ? "star" : "star-outline"}
              size={36}
              color={value <= stars ? STAR_COLOR : colors.border.focus}
              style={s.star}
            />
          </TouchableOpacity>
        ))}
      </View>

      {stars > 0 ? <Text style={s.ratingLabel}>{RATING_LABEL[stars]}</Text> : null}

      <TextInput
        style={s.input}
        value={comment}
        onChangeText={(v) => setComment(v.slice(0, MAX_COMMENT))}
        placeholder="Add a comment (optional)"
        placeholderTextColor={colors.text.placeholder}
        multiline
        maxLength={MAX_COMMENT}
        editable={!submitting}
        accessibilityLabel="Rating comment"
      />

      {error ? <Text style={s.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[s.button, !canSubmit && s.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityLabel="Submit rating"
        accessibilityState={{ disabled: !canSubmit, busy: submitting }}
      >
        <LinearGradient
          colors={["#14B8A6", "#06B6D4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.buttonGradient}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={s.buttonText}>Submit rating</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.xxl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.text.primary,
  },
  helper: {
    fontSize: fontSize.base,
    color: colors.text.light,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  star: {
    marginHorizontal: 2,
  },
  ratingLabel: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: spacing.lg,
  },
  error: {
    fontSize: fontSize.base,
    color: colors.error,
    marginTop: spacing.sm,
  },
  button: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.white,
  },
  commentBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  commentText: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  thanks: {
    fontSize: fontSize.md,
    color: colors.text.light,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
