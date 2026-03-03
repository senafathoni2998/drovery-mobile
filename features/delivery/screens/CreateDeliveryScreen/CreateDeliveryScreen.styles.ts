import { StyleSheet } from "react-native";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";

export const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  // Header
  headerContainer: {
    marginBottom: -24,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: 80,
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
  headerTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.xxl,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  headerPlaceholder: {
    width: 36,
  },
  headerBlur: {
    position: "absolute",
    right: -48,
    top: -48,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  // Form Card
  formCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginTop: -24,
    minHeight: 500,
  },
  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text.primary,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  // Input Field
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
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
  inputIcon: {
    color: "#94A3B8",
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  // Swap Button
  swapButtonContainer: {
    alignItems: "center" as const,
    marginVertical: spacing.xs,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  // Package Size Selector
  sizeSelector: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
  },
  sizeOption: {
    flex: 1,
    minWidth: 70,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.white,
    alignItems: "center" as const,
  },
  sizeOptionActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  sizeOptionText: {
    fontSize: fontSize.md,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  sizeOptionTextActive: {
    color: colors.white,
  },
  // Date Time Row
  row: {
    flexDirection: "row" as const,
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  // Submit Button
  submitButton: {
    height: 52,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginTop: spacing.md,
  },
  submitGradient: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: spacing.sm,
  },
  submitText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.white,
  },
});
