import { StyleSheet } from "react-native";
import { spacing, borderRadius, colors } from "../../../../styles/common";

// Signup-specific styles
export const signupStyles = StyleSheet.create({
  signinContainer: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: spacing.xl,
  },
  signinText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  signinLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  submitButton: {
    height: 48,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
