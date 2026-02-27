import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { styles, colors, spacing } from "../LoginScreen.styles";

type FormErrors = {
  email?: string;
  password?: string;
};

type FormData = {
  email: string;
  password: string;
};

interface FormCardProps {
  formData: FormData;
  errors: FormErrors;
  loading: boolean;
  showPassword: boolean;
  remember: boolean;
  onUpdateField: <K extends keyof FormData>(field: K, value: string) => void;
  onTogglePassword: () => void;
  onToggleRemember: () => void;
  onSubmit: () => void;
  onSignup: () => void;
}

export function FormCard({
  formData,
  errors,
  loading,
  showPassword,
  remember,
  onUpdateField,
  onTogglePassword,
  onToggleRemember,
  onSubmit,
  onSignup,
}: FormCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.formCard}>
      {/* Email Input */}
      <InputField
        label="Email"
        icon="email"
        placeholder="you@example.com"
        value={formData.email}
        error={errors.email}
        onChangeText={(v) => onUpdateField("email", v)}
        editable={!loading}
        keyboardType="email-address"
      />

      {/* Password Input */}
      <PasswordField
        label="Password"
        value={formData.password}
        error={errors.password}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        onChangeText={(v) => onUpdateField("password", v)}
        editable={!loading}
      />

      {/* Remember Me & Forgot Password */}
      <View style={styles.rowContainer}>
        <Pressable
          style={styles.checkboxContainer}
          onPress={onToggleRemember}
          hitSlop={8}
        >
          <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
            {remember && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </Pressable>

        <Pressable hitSlop={8}>
          <Text style={styles.linkText}>Forgot password?</Text>
        </Pressable>
      </View>

      {/* Submit Button */}
      <Pressable onPress={onSubmit} disabled={loading} style={styles.submitButton}>
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
        <SocialButton icon="logo-google" label="Google" />
        <SocialButton icon="logo-apple" label="Apple" />
      </View>
    </Animated.View>
  );
}

// Sub-components
interface InputFieldProps {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  placeholder: string;
  value: string;
  error?: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  keyboardType?: "email-address" | "default";
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
          autoCapitalize="none"
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
        <Pressable onPress={onTogglePassword} style={styles.eyeButton} hitSlop={8}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#64748B" />
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
