import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { authService, SignupCredentials } from "../../../auth/services/authService";
import { styles } from "../LoginScreen/LoginScreen.styles";
import { SignupHeroCard } from "./components/SignupHeroCard";
import { signupStyles } from "./SignupScreen.styles";

// Animation Configuration
const animations = {
  hero: FadeIn.duration(500).springify(),
  formCard: FadeInDown.delay(100).duration(500).springify(),
  link: FadeInDown.delay(200).duration(500).springify(),
};

// Types
type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Initial State
const initialFormData: FormData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

// Validation Rules
const validationRules = {
  nameRequired: "Name is required",
  nameMinLength: "Min. 2 characters",
  emailRequired: "Email is required",
  emailInvalid: "Enter a valid email",
  passwordRequired: "Password is required",
  passwordMinLength: "Min. 6 characters",
  confirmPasswordRequired: "Please confirm your password",
  confirmPasswordMismatch: "Passwords do not match",
};

export function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>(initialFormData);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [loading, setLoading] = React.useState(false);

  // Effects
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp();
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

  // Handlers
  const updateField = <K extends keyof FormData>(field: K, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!formData.name) {
      next.name = validationRules.nameRequired;
    } else if (formData.name.length < 2) {
      next.name = validationRules.nameMinLength;
    }

    if (!formData.email) {
      next.email = validationRules.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = validationRules.emailInvalid;
    }

    if (!formData.password) {
      next.password = validationRules.passwordRequired;
    } else if (formData.password.length < 6) {
      next.password = validationRules.passwordMinLength;
    }

    if (!formData.confirmPassword) {
      next.confirmPassword = validationRules.confirmPasswordRequired;
    } else if (formData.password !== formData.confirmPassword) {
      next.confirmPassword = validationRules.confirmPasswordMismatch;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const credentials: SignupCredentials = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await authService.signup(credentials);

      if (response.success && response.token) {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => router.replace("/(tabs)") },
        ]);
      } else {
        Alert.alert("Signup Failed", response.error || "Please try again");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.replace("/login");

  // Render
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
        <SignupHeroCard entering={animations.hero} />

        {/* Form Card */}
        <Animated.View entering={animations.formCard} style={styles.formCard}>
          {/* Name Input */}
          <InputField
            label="Full Name"
            icon="person"
            placeholder="Enter your full name"
            value={formData.name}
            error={errors.name}
            onChangeText={(v) => updateField("name", v)}
            editable={!loading}
            autoCapitalize="words"
          />

          {/* Email Input */}
          <InputField
            label="Email"
            icon="email"
            placeholder="you@example.com"
            value={formData.email}
            error={errors.email}
            onChangeText={(v) => updateField("email", v)}
            editable={!loading}
            keyboardType="email-address"
          />

          {/* Password Input */}
          <PasswordField
            label="Password"
            value={formData.password}
            error={errors.password}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onChangeText={(v) => updateField("password", v)}
            editable={!loading}
          />

          {/* Confirm Password Input */}
          <PasswordField
            label="Confirm Password"
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
            onChangeText={(v) => updateField("confirmPassword", v)}
            editable={!loading}
          />

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={signupStyles.submitButton}
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
            <SocialButton icon="logo-google" label="Google" />
            <SocialButton icon="logo-apple" label="Apple" />
          </View>
        </Animated.View>

        {/* Sign In Link */}
        <Animated.View
          entering={animations.link}
          style={signupStyles.signinContainer}
        >
          <Text style={signupStyles.signinText}>Already have an account? </Text>
          <Pressable onPress={goToLogin}>
            <Text style={signupStyles.signinLink}>Sign In</Text>
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

// ==================== SUB-COMPONENTS ====================

interface InputFieldProps {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  placeholder: string;
  value: string;
  error?: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  keyboardType?: "email-address" | "default";
  autoCapitalize?: "none" | "words";
}

function InputField({
  label,
  icon,
  placeholder,
  value,
  error,
  onChangeText,
  editable,
  keyboardType = "default",
  autoCapitalize = "none",
}: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <MaterialIcons name={icon} size={20} color="#94A3B8" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  error?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  onChangeText: (text: string) => void;
  editable: boolean;
}

function PasswordField({
  label,
  value,
  error,
  showPassword,
  onTogglePassword,
  onChangeText,
  editable,
}: PasswordFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <MaterialIcons name="lock" size={20} color="#94A3B8" />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          editable={editable}
        />
        <Pressable
          onPress={onTogglePassword}
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
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

interface SocialButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

function SocialButton({ icon, label }: SocialButtonProps) {
  return (
    <Pressable style={styles.socialButton}>
      <Ionicons name={icon} size={18} color="#64748B" />
      <Text style={styles.socialButtonText}>{label}</Text>
    </Pressable>
  );
}
