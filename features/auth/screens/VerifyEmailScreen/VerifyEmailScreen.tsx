import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { useAuth } from "@/contexts/AuthContext";
import { verificationApi } from "@/features/auth/services/verificationApi";

type Status = "idle" | "verifying" | "verified" | "error";

export function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ token?: string }>();
  const { refreshUser, isAuthenticated } = useAuth();

  const [token, setToken] = useState(params.token ?? "");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const verify = async (value: string) => {
    if (!value.trim()) {
      setError("Verification code is required");
      return;
    }
    setStatus("verifying");
    setError(null);
    try {
      await verificationApi.verifyEmail(value.trim());
      await refreshUser();
      setStatus("verified");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired code. Request a new one.",
      );
    }
  };

  // Auto-verify when arriving via the email deep link.
  useEffect(() => {
    if (params.token) {
      verify(params.token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await verificationApi.resendVerification();
      setError("We've sent a new verification email.");
    } catch {
      setError("Couldn't resend right now. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.lg, paddingHorizontal: spacing.lg }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.replace(isAuthenticated ? "/(tabs)" : "/login")}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <LinearGradient
        colors={["#2DD4BF", "#22D3EE", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroIcon}>
          <MaterialIcons
            name={status === "verified" ? "mark-email-read" : "alternate-email"}
            size={28}
            color="#fff"
          />
        </View>
        <Text style={styles.heroTitle}>
          {status === "verified" ? "Email verified" : "Verify your email"}
        </Text>
        <Text style={styles.heroSubtitle}>
          {status === "verified"
            ? "Thanks! Your email is now confirmed."
            : "Enter the code from your email, or tap the link we sent."}
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        {status === "verifying" ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary.DEFAULT} />
            <Text style={styles.metaText}>Verifying…</Text>
          </View>
        ) : status === "verified" ? (
          <Pressable
            style={styles.submitButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <LinearGradient
              colors={["#14B8A6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>Continue</Text>
            </LinearGradient>
          </Pressable>
        ) : (
          <>
            <Text style={styles.label}>Verification code</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons name="vpn-key" size={20} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="Paste the code from your email"
                placeholderTextColor="#94A3B8"
                value={token}
                onChangeText={(v) => {
                  setToken(v);
                  setError(null);
                }}
                autoCapitalize="none"
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable style={styles.submitButton} onPress={() => verify(token)}>
              <LinearGradient
                colors={["#14B8A6", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>Verify email</Text>
              </LinearGradient>
            </Pressable>

            {isAuthenticated && (
              <TouchableOpacity onPress={handleResend} disabled={resending} hitSlop={8}>
                <Text style={styles.linkText}>
                  {resending ? "Sending…" : "Resend verification email"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, gap: spacing.lg },
  backButton: { flexDirection: "row", alignItems: "center", gap: 2 },
  backText: { fontSize: fontSize.base, color: colors.text.primary, fontWeight: "500" },
  hero: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    overflow: "hidden",
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  heroTitle: { fontSize: fontSize.xl, fontWeight: "800", color: "#fff" },
  heroSubtitle: { fontSize: fontSize.base, color: "rgba(255,255,255,0.9)" },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.xl,
    gap: spacing.md,
  },
  center: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },
  metaText: { fontSize: fontSize.base, color: colors.text.secondary },
  label: { fontSize: fontSize.md, fontWeight: "600", color: colors.text.secondary },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: "#F8FAFC",
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  errorText: { fontSize: fontSize.sm, color: "#E11D48" },
  submitButton: { borderRadius: borderRadius.lg, overflow: "hidden", marginTop: spacing.xs },
  submitGradient: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
  },
  submitText: { fontSize: fontSize.base, fontWeight: "700", color: "#fff" },
  linkText: {
    fontSize: fontSize.base,
    color: colors.primary.DEFAULT,
    fontWeight: "600",
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
