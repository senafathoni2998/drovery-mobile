import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { spacing, borderRadius, colors } from "@/styles/common";
import type { QuickAction } from "../HomeScreen.types";

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const router = useRouter();
  const [packageModalVisible, setPackageModalVisible] = useState(false);

  const handleActionPress = (label: string) => {
    switch (label) {
      case "New Delivery":
        router.push("/create-delivery");
        break;
      case "Load/Unload":
        setPackageModalVisible(true);
        break;
      case "Track Package":
        router.push("/track-package");
        break;
      case "Price Estimate":
        router.push("/price-estimation");
        break;
    }
  };

  const handleWorkflow = (workflowId: string) => {
    setPackageModalVisible(false);
    router.push({ pathname: "/workflow", params: { workflowId } });
  };

  const QuickActionButton = ({ label, icon, tone }: QuickAction) => (
    <TouchableOpacity
      style={styles.quickButton}
      onPress={() => handleActionPress(label)}
    >
      <LinearGradient
        colors={tone}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quickButtonGradient}
      >
        <View style={styles.quickIconContainer}>
          <MaterialIcons name={icon} size={20} color="#fff" />
        </View>
        <Text style={styles.quickButtonText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(100).duration(500).springify()}
        style={styles.quickSection}
      >
        <View style={styles.quickGrid}>
          {actions.map((action) => (
            <QuickActionButton key={action.label} {...action} />
          ))}
        </View>
      </Animated.View>

      {/* Package workflow picker modal */}
      <Modal
        visible={packageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPackageModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPackageModalVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            <Text style={styles.modalTitle}>Package Workflow</Text>
            <Text style={styles.modalSubtitle}>
              Choose the workflow for your package
            </Text>

            <View style={styles.modalOptions}>
              {/* Load Package */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleWorkflow("load_package")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#14B8A6", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionIconWrapper}
                >
                  <Ionicons name="arrow-up-circle-outline" size={28} color="#fff" />
                </LinearGradient>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Load Package</Text>
                  <Text style={styles.optionDesc}>
                    Load your package into the drone
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.text.placeholder}
                />
              </TouchableOpacity>

              {/* Unload Package */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleWorkflow("unload_package")}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#6366F1", "#0EA5E9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionIconWrapper}
                >
                  <Ionicons name="arrow-down-circle-outline" size={28} color="#fff" />
                </LinearGradient>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Unload Package</Text>
                  <Text style={styles.optionDesc}>
                    Collect your package from the drone
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.text.placeholder}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setPackageModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  quickSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  quickGrid: {
    flexDirection: "row" as const,
    gap: spacing.sm,
  },
  quickButton: {
    flex: 1,
    aspectRatio: 1,
  },
  quickButtonGradient: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: spacing.xs,
  },
  quickButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.white,
    textAlign: "center",
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.focus,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.text.light,
    textAlign: "center",
    marginTop: -spacing.sm,
  },
  modalOptions: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  optionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.text.light,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.light,
  },
});
