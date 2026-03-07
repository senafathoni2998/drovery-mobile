import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Types ─────────────────────────────────────────────────────────────────────

interface EditProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      fullName: "Sena",
      email: "sena@drovery.com",
      phone: "+62 812 3456 7890",
      address: "Jalan Ahmad Yani 1 No. 77 RT 12 RW 13, Tanjung Duren, Jakarta",
      bio: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (data: EditProfileFormData) => {
    // TODO: call profile update API
    console.log("Profile updated:", data);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ── Header ── */}
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Profile</Text>
        <View style={s.headerDecor} />
      </LinearGradient>

      {/* ── Avatar ── */}
      <View style={s.avatarWrapper}>
        <LinearGradient
          colors={["#14B8A6", "#06B6D4"]}
          style={s.avatar}
        >
          <Ionicons name="person" size={36} color={colors.white} />
        </LinearGradient>
        <TouchableOpacity style={s.avatarEditBadge}>
          <MaterialIcons name="camera-alt" size={14} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={s.formCard}>

          {/* Personal Info */}
          <SectionTitle icon="person" label="Personal Information" />

          <Controller
            control={control}
            name="fullName"
            rules={{ required: "Full name is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Full Name"
                icon="badge"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.fullName?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Email"
                icon="email"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{ required: "Phone number is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Phone Number"
                icon="phone"
                placeholder="Enter your phone number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
          />

          <Divider />

          {/* Address */}
          <SectionTitle icon="location-on" label="Default Address" />

          <Controller
            control={control}
            name="address"
            rules={{ required: "Address is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Address"
                icon="home"
                placeholder="Enter your default address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                error={errors.address?.message}
              />
            )}
          />

          <Divider />

          {/* Bio */}
          <SectionTitle icon="info" label="About" />

          <Controller
            control={control}
            name="bio"
            render={({ field: { onChange, onBlur, value } }) => (
              <Field
                label="Bio"
                icon="edit-note"
                placeholder="Tell us a little about yourself (optional)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
              />
            )}
          />
        </Animated.View>

        {/* ── Save button ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <TouchableOpacity
            style={[s.saveButton, !isDirty && s.saveButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
          >
            <MaterialIcons name="check" size={20} color={colors.white} />
            <Text style={s.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.sectionTitle}>
      <MaterialIcons name={icon as any} size={16} color={colors.primary.DEFAULT} />
      <Text style={s.sectionTitleText}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

interface FieldProps {
  label: string;
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
  error?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
}

function Field({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  keyboardType = "default",
  autoCapitalize = "words",
  multiline = false,
}: FieldProps) {
  return (
    <View style={s.fieldWrapper}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={[s.fieldRow, !!error && s.fieldRowError]}>
        <MaterialIcons
          name={icon as any}
          size={18}
          color={error ? colors.error : colors.text.placeholder}
          style={s.fieldIcon}
        />
        <TextInput
          style={[s.fieldInput, multiline && s.fieldInputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? "top" : "center"}
        />
      </View>
      {!!error && <Text style={s.fieldError}>{error}</Text>}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    overflow: "hidden",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.xxl,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.white,
    marginLeft: spacing.md,
  },
  headerDecor: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  avatarWrapper: {
    alignSelf: "center",
    marginTop: -32,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitleText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text.light,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.xs,
  },
  fieldWrapper: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  fieldRowError: {
    borderColor: colors.border.error,
    backgroundColor: "#FFF5F5",
  },
  fieldIcon: {
    marginRight: spacing.sm,
  },
  fieldInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
    paddingVertical: spacing.sm,
  },
  fieldInputMultiline: {
    paddingTop: spacing.sm,
    minHeight: 72,
  },
  fieldError: {
    fontSize: fontSize.xs,
    color: colors.error,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: colors.white,
  },
});
