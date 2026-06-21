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
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { borderRadius, colors, spacing } from "@/styles/common";
import { ApiError } from "@/services/api/apiClient";
import { deliveryApi } from "../../../services/deliveryApi";
import {
  clearHandoffCode,
  getHandoffCode,
} from "../../../services/handoffCodeStore";

interface HandoffConfirmCardProps {
  deliveryId: string;
  toAddress: string;
  /** Re-fetch the delivery (the server is the source of truth for the new state). */
  onConfirmed: () => void;
}

/**
 * Inline card shown ONLY while a delivery is AWAITING_HANDOFF. The recipient's
 * 6-digit code finalizes the delivery (→ DELIVERED). Errors are discriminated by
 * HTTP status (never message text); a wrong-code 401 stays in the card (the API
 * call opts out of the auth-refresh/logout interceptor via noAuthRetry).
 */
export function HandoffConfirmCard({
  deliveryId,
  toAddress,
  onConfirmed,
}: HandoffConfirmCardProps) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);

  const handleChange = (v: string) => {
    setCode(v.replace(/\D/g, "").slice(0, 6));
    setError(null);
  };

  const handleConfirm = async () => {
    if (submitting || code.length !== 6) return;
    setSubmitting(true);
    setError(null);
    try {
      await deliveryApi.confirmHandoff(deliveryId, code);
      void clearHandoffCode(deliveryId); // code is spent
      Alert.alert("Delivery confirmed", "Your package has been handed off.");
      onConfirmed();
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      if (status === 401) {
        // Wrong code, still under the attempt cap.
        setCode("");
        setError("That code isn't right. Check it with your recipient and try again.");
      } else if (status === 423) {
        // Locked: the backend has already failed the delivery. Resync the UI.
        void clearHandoffCode(deliveryId);
        Alert.alert(
          "Handoff locked",
          "Too many incorrect codes — this delivery has been marked as failed. Please contact support.",
        );
        onConfirmed();
      } else if (status === 409 || status === 404) {
        // Raced (already completed / no longer awaiting / gone) — resync.
        Alert.alert(
          "Couldn't confirm",
          err instanceof ApiError
            ? err.message
            : "This delivery is no longer awaiting handoff.",
        );
        onConfirmed();
      } else {
        // Network / 5xx — keep the entered code so the user can retry.
        setError(
          status === 0
            ? "Network problem — check your connection and try again."
            : "Something went wrong. Please try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReveal = async () => {
    const stored = await getHandoffCode(deliveryId).catch(() => null);
    // The code is only ever stored on the device that created the delivery, and
    // the server never returns it again. A cache miss means "wrong device", not a
    // support ticket — so guide the user to the sender instead of a dead end.
    setRevealed(
      stored ??
        "This code is only saved on the phone that created the delivery. Ask the sender to read it to you.",
    );
  };

  const canSubmit = code.length === 6 && !submitting;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="lock-open" size={20} color={colors.primary.DEFAULT} />
        <Text style={styles.title}>Confirm handoff</Text>
      </View>
      <Text style={styles.helper}>
        Enter the 6-digit code to release your package. The drone is waiting at{" "}
        {toAddress}.
      </Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={6}
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        placeholder="••••••"
        placeholderTextColor={colors.text.placeholder}
        editable={!submitting}
        accessibilityLabel="6-digit handoff code"
        accessibilityHint="Enter the code shared with your recipient to release the package"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Text style={styles.caution}>
        After several incorrect tries this delivery is locked and marked failed.
      </Text>

      <TouchableOpacity
        style={[styles.button, !canSubmit && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityLabel="Confirm handoff"
        accessibilityState={{ disabled: !canSubmit, busy: submitting }}
      >
        <LinearGradient
          colors={["#14B8A6", "#06B6D4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonGradient}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Confirm handoff</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleReveal}
        accessibilityRole="button"
        accessibilityLabel="Forgot the code? Show mine"
      >
        <Text style={styles.reveal}>Forgot the code? Show mine</Text>
      </TouchableOpacity>
      {revealed ? <Text style={styles.revealed}>{revealed}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  helper: {
    fontSize: 13,
    color: colors.text.light,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 8,
    textAlign: "center",
    color: colors.text.primary,
  },
  error: {
    fontSize: 13,
    color: "#E11D48",
    marginTop: spacing.sm,
  },
  caution: {
    fontSize: 12,
    color: colors.text.placeholder,
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
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  reveal: {
    fontSize: 13,
    color: colors.primary.DEFAULT,
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.md,
  },
  revealed: {
    fontSize: 13,
    color: colors.text.light,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
