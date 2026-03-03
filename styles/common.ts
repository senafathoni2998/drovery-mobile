import { StyleSheet } from "react-native";

// ==================== COLORS ====================
export const colors = {
  // Backgrounds
  background: "#F8FAFC",
  white: "#fff",

  // Text
  text: {
    primary: "#1E293B",
    secondary: "#334155",
    muted: "#475569",
    light: "#64748B",
    placeholder: "#94A3B8",
    inverse: "#fff",
  },

  // Primary (Teal)
  primary: {
    DEFAULT: "#0D9488",
    light: "#14B8A6",
    lighter: "#22D3EE",
    dark: "#0F766E",
    50: "#CCFBF1",
    100: "#99F6E4",
    500: "#14B8A6",
    600: "#0D9488",
    700: "#0F766E",
  },

  // Accents
  accent: {
    teal: ["#2DD4BF", "#22D3EE", "#3B82F6"] as const,
    primary: ["#14B8A6", "#06B6D4"] as const,
    green: ["#10B981", "#84CC16"] as const,
    purple: ["#6366F1", "#0EA5E9"] as const,
    orange: ["#F59E0B", "#F97316"] as const,
    red: ["#EF4444", "#F43F5E"] as const,
  },

  // Status
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Borders
  border: {
    DEFAULT: "#E2E8F0",
    light: "#F1F5F9",
    focus: "#CBD5E1",
    error: "#FB7185",
  },

  // Gradients
  gradient: {
    primary: ["#14B8A6", "#06B6D4"] as const,
    hero: ["#2DD4BF", "#22D3EE", "#3B82F6"] as const,
  },
} as const;

// ==================== SPACING ====================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ==================== BORDER RADIUS ====================
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// ==================== FONT SIZES ====================
export const fontSize = {
  xs: 10,
  sm: 11,
  md: 12,
  base: 14,
  lg: 15,
  xl: 16,
  "2xl": 18,
  "3xl": 20,
  "4xl": 24,
};

// ==================== COMMON STYLES ====================
export const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Card Base
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  cardElevated: {
    ...StyleSheet.flatten(StyleSheet.create({ card: {} }).card),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Input
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
  },

  inputWrapperError: {
    borderColor: colors.border.error,
  },

  input: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },

  // Buttons
  buttonPrimary: {
    height: 48,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },

  buttonSecondary: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.focus,
    backgroundColor: colors.white,
    paddingVertical: 14,
  },

  // Text
  textLabel: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },

  textError: {
    fontSize: fontSize.md,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },

  textSmall: {
    fontSize: fontSize.md,
    color: colors.text.light,
  },

  textLink: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.primary.DEFAULT,
  },

  // Header with gradient
  gradientHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },

  // Icon containers
  iconContainerSm: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  iconContainerMd: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },

  iconContainerLg: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xxl,
    backgroundColor: "#F0FDFA",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
});

// ==================== HELPER FUNCTIONS ====================
export const createStyle = (
  base: any,
  ...overrides: any[]
) => {
  return StyleSheet.create({
    ...base,
    ...overrides.reduce((acc, override) => ({ ...acc, ...override }), {}),
  });
};

export const cardWithShadow = (level: "sm" | "md" | "lg" = "md") => {
  const shadows = {
    sm: { shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    md: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    lg: { shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  };

  return {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    ...shadows[level],
  };
};

export const statusBadge = (status: "completed" | "canceled" | "current" | "in-progress") => {
  const config = {
    completed: { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0", icon: "checkmark-circle" as const, label: "Completed" },
    canceled: { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA", icon: "close-circle" as const, label: "Canceled" },
    current: { bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD", icon: "time" as const, label: "Current" },
    "in-progress": { bg: "#E0F2FE", color: "#0369A1", border: "#BAE6FD", icon: "time" as const, label: "In Progress" },
  };
  return config[status];
};
