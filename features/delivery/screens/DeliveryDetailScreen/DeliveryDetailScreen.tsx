import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  borderRadius,
  colors,
  commonStyles,
  spacing,
} from "../../../../styles/common";
import {
  CURRENT_STEP_INDEX,
  MOCK_DELIVERY,
  STEPS,
  type Delivery,
} from "./DeliveryDetailScreen.types";
import { FooterActions } from "./components/FooterActions";
import { InfoItem } from "./components/InfoItem";
import { StepItem } from "./components/StepItem";

// ==================== MAIN COMPONENT ====================
export function DeliveryDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const delivery: Delivery = MOCK_DELIVERY;

  const handleBack = () => router.back();
  const handleTrackMap = () => {
    // TODO: Implement map navigation
  };
  const handleContactSupport = () => {
    // TODO: Implement contact support
  };

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
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
              <Text style={styles.headerTitle}>Delivery Detail</Text>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerBadges}>
              <View style={styles.idBadge}>
                <MaterialIcons name="route" size={14} color="#fff" />
                <Text style={styles.idBadgeText}>Id: {delivery.id}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{delivery.status}</Text>
              </View>
            </View>

            <View style={styles.headerBlur} />
          </LinearGradient>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <InfoRow>
            <InfoItem
              icon="location-on"
              iconType="Material"
              label="From"
              value={delivery.from}
              color={colors.primary.DEFAULT}
            />
            <InfoItem
              icon="location-on"
              iconType="Material"
              label="To"
              value={delivery.to}
              color="#F43F5E"
            />
          </InfoRow>

          <InfoRow>
            <InfoItem
              icon="person"
              iconType="Material"
              label="Sender"
              value={delivery.sender}
              color="#6366F1"
            />
            <InfoItem
              icon="person"
              iconType="Material"
              label="Receiver"
              value={delivery.receiver}
              color="#0EA5E9"
            />
          </InfoRow>

          <InfoRow>
            <InfoItem
              icon="calendar-month"
              iconType="Material"
              label="Pickup Date"
              value={delivery.pickupAt}
              color={colors.success}
            />
            <InfoItem
              icon="schedule"
              iconType="Material"
              label="Estimated Date"
              value={delivery.eta}
              color={colors.warning}
            />
          </InfoRow>

          <InfoItem
            icon="inventory-2"
            iconType="Material"
            label="Package"
            value={delivery.pkg.name}
            subValue={`${delivery.pkg.size} • ${delivery.pkg.weight}`}
            color={colors.warning}
          />
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status</Text>
            <Text style={styles.statusValue}>{delivery.status}</Text>
          </View>

          <View style={styles.stepsContainer}>
            <View style={styles.stepsLine} />
            <View style={styles.stepsList}>
              {STEPS.map((step, index) => {
                const state: "done" | "current" | "upcoming" =
                  index < CURRENT_STEP_INDEX
                    ? "done"
                    : index === CURRENT_STEP_INDEX
                      ? "current"
                      : "upcoming";
                return (
                  <StepItem
                    key={step.title}
                    step={step}
                    index={index}
                    state={state}
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Footer Actions */}
        <FooterActions
          onTrackMap={handleTrackMap}
          onContactSupport={handleContactSupport}
        />
      </ScrollView>
    </View>
  );
}

// ==================== SUB-COMPONENTS ====================
function InfoRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.infoRow}>{children}</View>;
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  headerContainer: {
    marginBottom: -48,
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
  notificationButton: {
    padding: spacing.xs,
  },
  headerBadges: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: spacing.sm,
  },
  idBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.xs,
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  idBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.white,
  },
  statusBadge: {
    borderRadius: borderRadius.lg,
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
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
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.xxl,
    marginHorizontal: spacing.lg,
    marginTop: -16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    gap: spacing.xl,
  },
  infoRow: {
    flexDirection: "row" as const,
    gap: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.xxl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: spacing.xl,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary.DEFAULT,
  },
  stepsContainer: {
    position: "relative",
  },
  stepsLine: {
    position: "absolute",
    left: 11,
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: colors.border.DEFAULT,
  },
  stepsList: {
    gap: 24,
  },
});
