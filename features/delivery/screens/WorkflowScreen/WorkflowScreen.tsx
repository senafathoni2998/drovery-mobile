import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { borderRadius, colors, spacing } from "@/styles/common";
import { WORKFLOWS } from "../../workflow/data";
import type { WorkflowStep } from "../../workflow/types";
import { ChecklistStep } from "./components/ChecklistStep";
import { DroneButtonStep } from "./components/DroneButtonStep";
import { InstructionStep } from "./components/InstructionStep";
import { QRDisplayStep } from "./components/QRDisplayStep";
import { QRScanStep } from "./components/QRScanStep";
import { StatusCheckStep } from "./components/StatusCheckStep";

const STEP_ICONS: Record<WorkflowStep["type"], string> = {
  checklist: "checkbox-outline",
  qr_display: "qr-code-outline",
  qr_scan: "scan-outline",
  instruction: "information-circle-outline",
  drone_button: "radio-button-on-outline",
  status_check: "radio-button-on",
};

export function WorkflowScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workflowId, deliveryId } = useLocalSearchParams<{
    workflowId: string;
    deliveryId?: string;
  }>();

  const workflow = WORKFLOWS[workflowId ?? ""];
  const firstStep = workflow?.steps[0];
  const firstStepGated = firstStep?.type === "checklist" || firstStep?.type === "qr_scan";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextEnabled, setNextEnabled] = useState(!firstStepGated);

  if (!workflow) {
    return (
      <View style={[styles.errorContainer, { paddingTop: insets.top }]}>
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text style={styles.errorText}>Workflow not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorBack}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const step = workflow.steps[currentIndex];
  const isLast = currentIndex === workflow.steps.length - 1;
  const progress = (currentIndex + 1) / workflow.steps.length;

  const isStepGated = (index: number) => {
    const s = workflow.steps[index];
    return s.type === "checklist" || s.type === "qr_scan";
  };

  const handleNext = () => {
    if (isLast) {
      router.back();
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setNextEnabled(!isStepGated(nextIndex));
  };

  const handleBack = () => {
    if (currentIndex === 0) {
      router.back();
    } else {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setNextEnabled(!isStepGated(prevIndex));
    }
  };

  const isChecklistStep = step.type === "checklist";
  const isQRScanStep = step.type === "qr_scan";
  const isDisabled = (isChecklistStep || isQRScanStep) && !nextEnabled;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>{workflow.title}</Text>
            <Text style={styles.headerSubtitle}>
              Step {currentIndex + 1} of {workflow.steps.length}
            </Text>
          </View>
          <View style={styles.backButton} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </LinearGradient>

      {/* Step dots */}
      <View style={styles.dotsRow}>
        {workflow.steps.map((s, i) => (
          <View
            key={s.id}
            style={[
              styles.dot,
              i < currentIndex && styles.dotDone,
              i === currentIndex && styles.dotCurrent,
              i > currentIndex && styles.dotUpcoming,
            ]}
          >
            {i < currentIndex && (
              <Ionicons name="checkmark" size={10} color="#fff" />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step card */}
        <View style={styles.card}>
          {/* Step icon + title */}
          <View style={styles.stepHeader}>
            <View style={styles.stepIconWrapper}>
              <Ionicons
                name={STEP_ICONS[step.type] as any}
                size={22}
                color={colors.primary.DEFAULT}
              />
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
          </View>

          <View style={styles.divider} />

          {/* Step content */}
          <View style={styles.stepContent}>
            {step.type === "checklist" && (
              <ChecklistStep
                step={step}
                onReady={(ready) => {
                  setNextEnabled(ready);
                }}
              />
            )}
            {step.type === "qr_display" && (
              <QRDisplayStep step={step} deliveryId={deliveryId} />
            )}
            {step.type === "qr_scan" && (
              <QRScanStep
                step={step}
                onScanned={() => setNextEnabled(true)}
              />
            )}
            {step.type === "instruction" && <InstructionStep step={step} />}
            {step.type === "drone_button" && <DroneButtonStep step={step} />}
            {step.type === "status_check" && <StatusCheckStep step={step} />}
          </View>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <TouchableOpacity
          style={[styles.nextButton, isDisabled && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isDisabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDisabled ? ["#CBD5E1", "#CBD5E1"] : ["#14B8A6", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>{step.next_label}</Text>
            <Ionicons
              name={isLast ? "checkmark-circle-outline" : "arrow-forward"}
              size={18}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: "500",
  },
  errorBack: {
    fontSize: 14,
    color: colors.primary.DEFAULT,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleGroup: {
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: borderRadius.full,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  dotCurrent: {
    backgroundColor: colors.primary.DEFAULT,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: `${colors.primary.DEFAULT}40`,
  },
  dotUpcoming: {
    backgroundColor: colors.border.focus,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  stepIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  stepTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xl,
  },
  stepContent: {
    padding: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  nextButton: {
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: 16,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
