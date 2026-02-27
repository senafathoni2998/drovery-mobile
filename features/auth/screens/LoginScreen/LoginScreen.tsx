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
  BackHandler,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, colors } from "./LoginScreen.styles";
import { HeroCard } from "./components/HeroCard";
import { FormCard } from "./components/FormCard";

// Animation Configuration
const animations = {
  hero: FadeIn.duration(500).springify(),
  formCard: FadeInDown.delay(100).duration(500).springify(),
  link: FadeInDown.delay(200).duration(500).springify(),
};

// Types
type FormErrors = {
  email?: string;
  password?: string;
};

type FormData = {
  email: string;
  password: string;
};

// Initial State
const initialFormData: FormData = {
  email: "",
  password: "",
};

// Validation Rules
const validationRules = {
  emailRequired: "Email is required",
  emailInvalid: "Enter a valid email",
  passwordRequired: "Password is required",
  passwordMinLength: "Min. 6 characters",
};

export function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // Effects
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      BackHandler.exitApp();
      return true;
    });
    return () => subscription.remove();
  }, []);

  // Handlers
  const updateField = <K extends keyof FormData>(field: K, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};

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

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    // TODO: Connect to your auth API here
    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)");
    }, 500);
  };

  const goToSignup = () => router.push("/signup");

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
        <HeroCard
          title="Welcome back"
          subtitle="Log in to continue"
          icon="shield-checkmark"
          entering={animations.hero}
        />

        {/* Form Card */}
        <FormCard
          formData={formData}
          errors={errors}
          loading={loading}
          showPassword={showPassword}
          remember={remember}
          onUpdateField={updateField}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onToggleRemember={() => setRemember(!remember)}
          onSubmit={handleSubmit}
          onSignup={goToSignup}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
