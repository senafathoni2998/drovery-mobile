import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Shared animation configuration
const headerAnim = FadeIn.duration(500).springify();
const cardAnim = FadeInDown.delay(100).duration(500).springify();
const statusAnim = FadeInDown.delay(200).duration(500).springify();
const footerAnim = FadeInDown.delay(300).duration(500).springify();

// Types
type StepState = "done" | "current" | "upcoming";

// Mock Data (in real app, this would come from params or API)
const delivery = {
  id: "124213152",
  status: "On Progress",
  from: "Jl. Padjajaran Raya No. 21",
  to: "Jl. Otto Iskandar Dinata No.21",
  sender: "Mika Ratna",
  receiver: "Moko diska",
  pickupAt: "25 March 2025, 09:00 AM",
  eta: "25 March 2025, 11:00 AM",
  pkg: {
    name: "Aspirin (Healthcare)",
    size: "12 cm × 24 cm × 40 cm",
    weight: "0.7 kg",
  },
};

const steps = [
  {
    title: "Pickup scheduled",
    desc: "The pickup process will start on 25 March 2025, 09:00 AM. A drone will come to the pickup location.",
  },
  {
    title: "Drone arrived",
    desc: "Drone arrived at pickup location, package is loaded into the drone storage.",
  },
  {
    title: "In delivery",
    desc: "The drone is delivering the package to the drop-off point.",
  },
  {
    title: "Delivered",
    desc: "The drone has successfully delivered the package to the destination point.",
  },
];

const currentStepIndex = 1;

// Info Item Component
interface InfoItemProps {
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap;
  iconType: "Material" | "Ion";
  label: string;
  value: string;
  subValue?: string;
  color: string;
}

function InfoItem({ icon, iconType, label, value, subValue, color }: InfoItemProps) {
  return (
    <View style={styles.infoItem}>
      <View style={[styles.infoIconContainer, { backgroundColor: `${color}15` }]}>
        {iconType === "Material" ? (
          <MaterialIcons name={icon as any} size={20} color={color} />
        ) : (
          <Ionicons name={icon as any} size={20} color={color} />
        )}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
        {subValue && <Text style={styles.infoSubValue}>{subValue}</Text>}
      </View>
    </View>
  );
}

// Step Item Component
interface StepItemProps {
  step: typeof steps[0];
  index: number;
  state: StepState;
}

function StepItem({ step, index, state }: StepItemProps) {
  return (
    <View style={styles.stepItem}>
      <View
        style={[
          styles.stepMarker,
          state === "done" && styles.stepMarkerDone,
          state === "current" && styles.stepMarkerCurrent,
          state === "upcoming" && styles.stepMarkerUpcoming,
        ]}
      >
        {state === "done" ? (
          <Ionicons name="checkmark" size={14} color="#10B981" />
        ) : state === "current" ? (
          <View style={styles.stepDot} />
        ) : (
          <Ionicons name="ellipse" size={12} color="#CBD5E1" />
        )}
      </View>
      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepTitle,
            state === "done" && styles.stepTitleDone,
            state === "current" && styles.stepTitleCurrent,
            state === "upcoming" && styles.stepTitleUpcoming,
          ]}
        >
          {step.title}
        </Text>
        <Text style={styles.stepDesc}>{step.desc}</Text>
      </View>
    </View>
  );
}

export default function DeliveryDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={headerAnim}>
          <LinearGradient
            colors={["#14B8A6", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        </Animated.View>

        {/* Summary Card */}
        <Animated.View entering={cardAnim} style={styles.summaryCard}>
          {/* From / To */}
          <View style={styles.infoRow}>
            <InfoItem
              icon="location-on"
              iconType="Material"
              label="From"
              value={delivery.from}
              color="#0D9488"
            />
            <InfoItem
              icon="location-on"
              iconType="Material"
              label="To"
              value={delivery.to}
              color="#F43F5E"
            />
          </View>

          {/* People */}
          <View style={styles.infoRow}>
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
          </View>

          {/* Dates */}
          <View style={styles.infoRow}>
            <InfoItem
              icon="calendar-month"
              iconType="Material"
              label="Pickup Date"
              value={delivery.pickupAt}
              color="#10B981"
            />
            <InfoItem
              icon="schedule"
              iconType="Material"
              label="Estimated Date"
              value={delivery.eta}
              color="#F59E0B"
            />
          </View>

          {/* Package */}
          <InfoItem
            icon="inventory-2"
            iconType="Material"
            label="Package"
            value={delivery.pkg.name}
            subValue={`${delivery.pkg.size} • ${delivery.pkg.weight}`}
            color="#F59E0B"
          />
        </Animated.View>

        {/* Status */}
        <Animated.View entering={statusAnim} style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Status</Text>
            <Text style={styles.statusValue}>{delivery.status}</Text>
          </View>

          <View style={styles.stepsContainer}>
            <View style={styles.stepsLine} />
            <View style={styles.stepsList}>
              {steps.map((step, index) => {
                const state: StepState =
                  index < currentStepIndex
                    ? "done"
                    : index === currentStepIndex
                    ? "current"
                    : "upcoming";
                return (
                  <StepItem key={step.title} step={step} index={index} state={state} />
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* Footer Actions */}
        <Animated.View entering={footerAnim} style={styles.footerSection}>
          <TouchableOpacity style={styles.primaryButton}>
            <LinearGradient
              colors={["#14B8A6", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="map" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>Track on Map</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
            <Text style={styles.secondaryButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  // Header
  header: {
    paddingTop: 16,
    paddingBottom: 80,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  notificationButton: {
    padding: 4,
  },
  headerBadges: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  idBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#fff",
  },
  statusBadge: {
    borderRadius: 16,
    backgroundColor: "rgba(52, 211, 153, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
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
  // Summary Card
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 24,
    marginHorizontal: 16,
    marginTop: -48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    gap: 20,
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  infoSubValue: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  // Status Card
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  statusValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#0D9488",
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
    backgroundColor: "#E2E8F0",
  },
  stepsList: {
    gap: 24,
  },
  stepItem: {
    flexDirection: "row",
    paddingLeft: 32,
    position: "relative",
  },
  stepMarker: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  stepMarkerDone: {
    borderColor: "#10B981",
    backgroundColor: "#10B981",
  },
  stepMarkerCurrent: {
    borderColor: "#0EA5E9",
  },
  stepMarkerUpcoming: {
    borderColor: "#CBD5E1",
  },
  stepDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#0EA5E9",
  },
  stepContent: {
    flex: 1,
    paddingLeft: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  stepTitleDone: {
    color: "#047857",
  },
  stepTitleCurrent: {
    color: "#0369A1",
  },
  stepTitleUpcoming: {
    color: "#94A3B8",
  },
  stepDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  // Footer Actions
  footerSection: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#fff",
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748B",
  },
});
