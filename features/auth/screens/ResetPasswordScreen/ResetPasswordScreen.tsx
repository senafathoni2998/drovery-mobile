import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

export function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ token?: string }>();

  const [token, setToken] = useState(params.token ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token.trim()) return setError("Reset code is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords don't match");

    setError(null);
    setLoading(true);
    try {
      await passwordApi.resetPassword(token.trim(), password);
      Alert.alert(
        "Password updated",
        "You can now log in with your new password.",
        [{ text: "Go to login", onPress: () => router.replace("/login") }],
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired reset code. Request a new link.",
      );
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
            <MaterialIcons name="lock-reset" size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Set a new password</Text>
          <Text style={styles.heroSubtitle}>
            Enter the reset code from your email and choose a new password.
          </Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.label}>Reset code</Text>
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
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>New password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={20} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                setError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#64748B"
              />
            </Pressable>
          </View>

          <Text style={styles.label}>Confirm new password</Text>
          <View style={styles.inputWrapper}>
            <MaterialIcons name="lock" size={20} color="#94A3B8" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={confirm}
              onChangeText={(v) => {
                setConfirm(v);
                setError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
            <LinearGradient
              colors={["#14B8A6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Reset password</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>
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
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
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
  errorText: { fontSize: fontSize.sm, color: "#E11D48", marginTop: spacing.xs },
  submitButton: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  submitText: { fontSize: fontSize.base, fontWeight: "700", color: "#fff" },
});
