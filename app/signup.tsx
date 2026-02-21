import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authService, SignupCredentials } from "../services/authService";

// Shared animation configuration - only for parent components
const heroAnim = FadeIn.duration(500).springify();
const formCardAnim = FadeInDown.delay(100).duration(500).springify();
const linkAnim = FadeInDown.delay(200).duration(500).springify();

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name) next.name = "Name is required";
    else if (name.length < 2) next.name = "Min. 2 characters";
    if (!email) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (!password) next.password = "Password is required";
    else if (password.length < 6) next.password = "Min. 6 characters";
    if (!confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit() {
    if (!validate()) return;

    setLoading(true);

    try {
      const credentials: SignupCredentials = {
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      };

      const response = await authService.signup(credentials);

      if (response.success && response.token) {
        Alert.alert("Success", "Account created successfully!", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]);
      } else {
        Alert.alert("Signup Failed", response.error || "Please try again");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
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
                <Ionicons name="person-add" size={28} color="#fff" />
              </View>
              <View>
                <Text style={styles.heroTitle}>Create account</Text>
                <Text style={styles.heroSubtitle}>Sign up to get started</Text>
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
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.name && styles.inputWrapperError,
              ]}
            >
              <MaterialIcons name="person" size={20} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
            {errors.name && (
              <Text style={styles.errorText}>{errors.name}</Text>
            )}
          </View>

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

          {/* Confirm Password Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.inputWrapper,
                errors.confirmPassword && styles.inputWrapperError,
              ]}
            >
              <MaterialIcons name="lock-outline" size={20} color="#94A3B8" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                hitSlop={8}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#64748B"
                />
              </Pressable>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
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
                  <Ionicons name="person-add" size={18} color="#fff" />
                  <Text style={styles.submitText}>Create Account</Text>
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

        {/* Sign In Link */}
        <Animated.View
          entering={linkAnim}
          style={styles.signinContainer}
        >
          <Text style={styles.signinText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace("/login")}>
            <Text style={styles.signinLink}>Sign In</Text>
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
  // Submit Button
  submitButton: {
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
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
  // Sign In
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signinText: {
    fontSize: 14,
    color: "#475569",
  },
  signinLink: {
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
