import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { StyleSheet } from "react-native";

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
    marginBottom: spacing.xs,
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
  headerSubtitle: {
    fontSize: fontSize.base,
    color: "rgba(255, 255, 255, 0.75)",
    textAlign: "center" as const,
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
  headerBlurSecondary: {
    position: "absolute",
    left: -32,
    bottom: -32,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  // Form Card
  formCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
    marginTop: -48,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  // Section
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.text.primary,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
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
    backgroundColor: colors.background,
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
    color: colors.primary.DEFAULT,
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
    borderRadius: borderRadius.full,
    backgroundColor: "#F0FDFA",
    borderWidth: 1.5,
    borderColor: "#99F6E4",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  // Package Size Selector
  sizeSelector: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: spacing.sm,
  },
  sizeOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.white,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    position: "relative" as const,
    gap: 2,
  },
  sizeOptionActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  sizeCheckBadge: {
    position: "absolute" as const,
    top: spacing.xs,
    right: spacing.xs,
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sizeOptionText: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: colors.text.primary,
  },
  sizeOptionTextActive: {
    color: colors.white,
  },
  sizeDims: {
    fontSize: fontSize.xs,
    color: colors.text.placeholder,
    textAlign: "center" as const,
  },
  sizeDimsActive: {
    color: "rgba(255,255,255,0.8)",
  },
  sizeWeight: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.text.muted,
    textAlign: "center" as const,
  },
  sizeWeightActive: {
    color: "rgba(255,255,255,0.9)",
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
    height: 56,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  submitGradient: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: spacing.sm,
  },
  submitText: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.white,
  },
});
