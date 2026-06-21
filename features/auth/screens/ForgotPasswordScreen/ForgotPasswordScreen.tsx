import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { passwordApi } from "@/features/auth/services/passwordApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) return setError("Email is required");
    if (!EMAIL_RE.test(trimmed)) return setError("Enter a valid email");

    setError(null);
    setLoading(true);
    try {
      await passwordApi.forgotPassword(trimmed);
      setSent(true);
    } catch {
      // Backend never reveals whether the email exists — show the same success.
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/login")}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
          <Text style={styles.backText}>Login</Text>
        </TouchableOpacity>

        <LinearGradient
          colors={["#2DD4BF", "#22D3EE", "#3B82F6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="lock-closed" size={26} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Forgot password?</Text>
          <Text style={styles.heroSubtitle}>
            Enter your email and we'll send you a reset link.
          </Text>
        </LinearGradient>

        {sent ? (
          <View style={styles.card}>
            <View style={styles.sentIcon}>
              <MaterialIcons name="mark-email-read" size={30} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.sentTitle}>Check your email</Text>
            <Text style={styles.sentBody}>
              If an account exists for {email.trim()}, we've sent a reset link.
              Open it on this device, or enter the reset code manually.
            </Text>
            <Pressable
              style={styles.submitButton}
              onPress={() => router.replace("/reset-password")}
            >
              <LinearGradient
                colors={["#14B8A6", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>Enter reset code</Text>
              </LinearGradient>
            </Pressable>
            <TouchableOpacity onPress={() => router.replace("/login")} hitSlop={8}>
              <Text style={styles.linkText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
              <MaterialIcons name="email" size={20} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            >
              <LinearGradient
                colors={["#14B8A6", "#06B6D4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitText}>Send reset link</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, gap: spacing.lg },
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
  inputWrapperError: { borderColor: "#FB7185" },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: fontSize.base, color: colors.text.primary },
  errorText: { fontSize: fontSize.sm, color: "#E11D48", marginLeft: spacing.xs },
  submitButton: { borderRadius: borderRadius.lg, overflow: "hidden", marginTop: spacing.xs },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
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
  sentIcon: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
  },
  sentTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  sentBody: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
