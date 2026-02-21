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
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Shared animation configuration - only for parent components
const heroAnim = FadeIn.duration(500).springify();
const formCardAnim = FadeInDown.delay(100).duration(500).springify();
const linkAnim = FadeInDown.delay(200).duration(500).springify();

type FormErrors = {
  email?: string;
  password?: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Min. 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;

    setLoading(true);
    // TODO: connect to your auth API here
    setTimeout(() => {
      setLoading(false);
      // Navigate to home page after successful login
      router.replace("/(tabs)");
    }, 500);
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <Animated.View entering={heroAnim} style={styles.heroContainer}>
          <LinearGradient
            colors={["#2DD4BF", "#22D3EE", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={28} color="#fff" />
              </View>
              <View>
                <Text style={styles.heroTitle}>Welcome back</Text>
                <Text style={styles.heroSubtitle}>Log in to continue</Text>
              </View>
            </View>
            <View style={styles.heroBlur} />
          </LinearGradient>
        </Animated.View>

        {/* Form Card */}
        <Animated.View
          entering={formCardAnim}
          style={styles.formCard}
        >
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.email && styles.inputWrapperError,
              ]}
            >
              <MaterialIcons name="email" size={20} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.password && styles.inputWrapperError,
              ]}
            >
              <MaterialIcons name="lock" size={20} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                hitSlop={8}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.rowContainer}>
            <Pressable
              style={styles.checkboxContainer}
              onPress={() => setRemember(!remember)}
              hitSlop={8}
            >
              <View
                style={[
                  styles.checkbox,
                  remember && styles.checkboxChecked,
                ]}
              >
                {remember && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </Pressable>

            <Pressable hitSlop={8}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </Pressable>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={onSubmit}
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
                <>
                  <Ionicons name="log-in" size={18} color="#fff" />
                  <Text style={styles.submitText}>Login</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialButtons}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={18} color="#64748B" />
              <Text style={styles.socialButtonText}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={18} color="#64748B" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Sign Up Link */}
        <Animated.View
          entering={linkAnim}
          style={styles.signupContainer}
        >
          <Text style={styles.signupText}>New here? </Text>
          <Pressable onPress={() => router.push("/signup")}>
            <Text style={styles.signupLink}>Create an account</Text>
          </Pressable>
        </Animated.View>

        {/* Footer */}
        <Text style={styles.footerText}>
          By continuing, you agree to our{" "}
          <Text style={styles.footerLink}>Terms</Text> and{" "}
          <Text style={styles.footerLink}>Privacy Policy</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    paddingBottom: 32,
  },
  // Hero Card
  heroContainer: {
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 2,
  },
  heroBlur: {
    position: "absolute",
    right: -48,
    top: -48,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  // Form Card
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  inputWrapperError: {
    borderColor: "#FB7185",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#E11D48",
    marginTop: 4,
    marginLeft: 4,
  },
  // Row Container
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#475569",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0D9488",
  },
  // Submit Button
  submitButton: {
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  submitGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: "#94A3B8",
  },
  // Social Buttons
  socialButtons: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  // Sign Up
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: "#475569",
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D9488",
  },
  // Footer
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 24,
  },
  footerLink: {
    textDecorationLine: "underline",
  },
});
