import { StyleSheet } from "react-native";

// Colors
const colors = {
  background: "#F8FAFC",
  white: "#fff",
  text: {
    primary: "#1E293B",
    secondary: "#334155",
    muted: "#475569",
    light: "#64748B",
    placeholder: "#94A3B8",
  },
  primary: {
    DEFAULT: "#0D9488",
    light: "#14B8A6",
    darker: "#0F766E",
  },
  border: {
    DEFAULT: "#E2E8F0",
    focus: "#CBD5E1",
    error: "#FB7185",
  },
  error: "#E11D48",
  gradient: ["#14B8A6", "#06B6D4"],
};

// Spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// Border Radius
const borderRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

// Common Styles
const card = {
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.border.DEFAULT,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
};

const inputWrapper = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  backgroundColor: colors.white,
  borderWidth: 1,
  borderColor: colors.border.DEFAULT,
  borderRadius: borderRadius.md,
  paddingHorizontal: spacing.md,
  paddingVertical: 10,
  gap: spacing.sm,
};

export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Hero Section
  heroContainer: {
    marginBottom: spacing.md,
  },
  heroCard: {
    ...card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  heroContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.white,
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
    ...card,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  // Input
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    ...inputWrapper,
  },
  inputWrapperError: {
    borderColor: colors.border.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  // Row (Remember me + Forgot password)
  rowContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: spacing.lg,
  },
  checkboxContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.focus,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  checkboxChecked: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text.muted,
  },
  linkText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary.DEFAULT,
  },

  // Button
  submitButton: {
    height: 48,
    borderRadius: borderRadius.md,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  submitGradient: {
    flex: 1,
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },

  // Divider
  dividerContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.DEFAULT,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: 12,
    color: colors.text.placeholder,
  },

  // Social Buttons
  socialButtons: {
    flexDirection: "row" as const,
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.focus,
    backgroundColor: colors.white,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.muted,
  },

  // Sign Up Link
  signupContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: spacing.xl,
  },
  signupText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },

  // Footer
  footerText: {
    fontSize: 12,
    color: colors.text.placeholder,
    textAlign: "center",
    marginTop: 24,
  },
  footerLink: {
    textDecorationLine: "underline",
  },
});

export { colors, spacing, borderRadius, card, inputWrapper };
