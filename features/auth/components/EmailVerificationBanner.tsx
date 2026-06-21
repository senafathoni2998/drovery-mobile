import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { useAuth } from "@/contexts/AuthContext";
import { verificationApi } from "@/features/auth/services/verificationApi";

/**
 * Dismissable-style prompt shown while the signed-in user's email is unverified.
 * Renders nothing once verified (or when signed out).
 */
export function EmailVerificationBanner() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  if (!isAuthenticated || !user || user.emailVerified) return null;

  const handleResend = async () => {
    setResending(true);
    try {
      await verificationApi.resendVerification();
      setResent(true);
    } catch {
      // best-effort
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.banner}>
      <MaterialIcons name="mark-email-unread" size={20} color="#B45309" />
      <View style={styles.body}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          {resent
            ? "Verification email sent — check your inbox."
            : `Confirm ${user.email} to secure your account.`}
        </Text>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/verify-email")} hitSlop={6}>
            <Text style={styles.actionPrimary}>Verify now</Text>
          </Pressable>
          {!resent && (
            <Pressable onPress={handleResend} disabled={resending} hitSlop={6}>
              <Text style={styles.actionSecondary}>
                {resending ? "Sending…" : "Resend email"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: fontSize.base, fontWeight: "700", color: "#92400E" },
  subtitle: { fontSize: fontSize.md, color: "#B45309" },
  actions: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.xs },
  actionPrimary: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: colors.primary.DEFAULT,
  },
  actionSecondary: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.light,
  },
});
