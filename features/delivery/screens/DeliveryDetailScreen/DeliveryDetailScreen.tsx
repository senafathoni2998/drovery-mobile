import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  failureReasonMessage,
  statusMeta,
} from "@/services/deliveryStatus";
import { deliveryApi } from "../../services/deliveryApi";
import { useDelivery } from "../../hooks/useDelivery";
import { clearHandoffCode } from "../../services/handoffCodeStore";
import { HandoffConfirmCard } from "./components/HandoffConfirmCard";
import { RateDeliverySheet } from "../../components/RateDeliverySheet";
import {
  STEPS,
  type Delivery,
} from "./DeliveryDetailScreen.types";
import { FooterActions } from "./components/FooterActions";
import { InfoItem } from "./components/InfoItem";
import { StepItem } from "./components/StepItem";

// Mirrors the backend: only these statuses can be canceled.
const CANCELABLE_STATUSES = ["SCHEDULED", "PENDING", "CONFIRMED"];

const PAYMENT_LABEL: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

// ==================== MAIN COMPONENT ====================
export function DeliveryDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { data: apiDelivery, loading, error, refetch } = useDelivery(params.id);
  const [canceling, setCanceling] = useState(false);
  const [reordering, setReordering] = useState(false);

  // Once the delivery settles, drop the cached handoff code (spent or moot) so a
  // stale secret doesn't linger on the device.
  const settledId =
    apiDelivery && statusMeta(apiDelivery.status).terminal ? apiDelivery.id : null;
  useEffect(() => {
    if (settledId) void clearHandoffCode(settledId);
  }, [settledId]);

  const canCancel =
    !!apiDelivery && CANCELABLE_STATUSES.includes(apiDelivery.status);

  const handleCancel = () => {
    if (!apiDelivery) return;
    Alert.alert(
      "Cancel delivery?",
      "This will cancel the delivery and recall the drone. This cannot be undone.",
      [
        { text: "Keep delivery", style: "cancel" },
        {
          text: "Cancel delivery",
          style: "destructive",
          onPress: async () => {
            try {
              setCanceling(true);
              await deliveryApi.cancel(apiDelivery.id);
              await refetch();
              Alert.alert("Delivery canceled", "Your delivery has been canceled.");
            } catch (err) {
              Alert.alert(
                "Couldn't cancel",
                err instanceof Error ? err.message : "Please try again.",
              );
            } finally {
              setCanceling(false);
            }
          },
        },
      ],
    );
  };

  const handleReorder = async () => {
    if (!apiDelivery) return;
    try {
      setReordering(true);
      const created = await deliveryApi.reorder(apiDelivery.id);
      router.replace({
        pathname: "/delivery-detail",
        params: { id: created.id },
      });
    } catch (err) {
      Alert.alert(
        "Couldn't reorder",
        err instanceof Error ? err.message : "Please try again.",
      );
    } finally {
      setReordering(false);
    }
  };

  const delivery: Delivery = apiDelivery
    ? {
        id: apiDelivery.trackingId,
        status: statusMeta(apiDelivery.status).label,
        from: apiDelivery.fromAddress,
        to: apiDelivery.toAddress,
        sender: "You",
        receiver: apiDelivery.receiver,
        pickupAt: `${new Date(apiDelivery.pickupDate).toLocaleDateString()}, ${apiDelivery.pickupTime}`,
        eta: apiDelivery.estimatedDelivery
          ? new Date(apiDelivery.estimatedDelivery).toLocaleString()
          : apiDelivery.pickupTime,
        pkg: {
          name: apiDelivery.packages,
          size: apiDelivery.packageSize,
          weight: `${apiDelivery.packageWeight} kg`,
        },
      }
    : {
        id: "",
        status: "",
        from: "",
        to: "",
        sender: "",
        receiver: "",
        pickupAt: "",
        eta: "",
        pkg: { name: "", size: "", weight: "" },
      };

  const meta = apiDelivery ? statusMeta(apiDelivery.status) : null;
  const CURRENT_STEP_INDEX = meta ? meta.step : 0;
  const exceptionNote =
    meta?.exception && apiDelivery
      ? failureReasonMessage(apiDelivery.failureReason)
      : null;

  const payment = apiDelivery?.payment ?? null;
  const paymentLabel = payment ? PAYMENT_LABEL[payment.status] ?? payment.status : "Pending";
  const paymentAmount = payment?.amount ?? apiDelivery?.estimatedPrice ?? 0;
  const paymentColor =
    payment?.status === "COMPLETED"
      ? colors.success
      : payment?.status === "FAILED"
        ? "#EF4444"
        : colors.warning;

  const proof = apiDelivery?.proofOfDelivery ?? null;

  if (loading) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  // Only show the full-screen error when there is NO data to render. A refetch
  // that fails *after* a successful confirm (we already hold a delivery) should
  // keep the last-good view, not wipe it to an error card. Gating on !apiDelivery
  // (rather than error && !apiDelivery) also covers the id-undefined path, where
  // the hook settles with data=null AND error=null — which would otherwise fall
  // through to an unguarded apiDelivery.status deref below.
  if (!apiDelivery) {
    return (
      <View style={[commonStyles.container, { paddingTop: insets.top, justifyContent: "center", alignItems: "center", padding: 24 }]}>
        <Text style={{ color: "red", textAlign: "center", marginBottom: 8 }}>
          {error ?? "Delivery not found"}
        </Text>
        <Text style={{ color: "#666", fontSize: 12, textAlign: "center" }}>
          id: {params.id ?? "undefined"}
        </Text>
      </View>
    );
  }

  const handleBack = () => router.back();
  const handleTrackMap = () => {
    router.push({ pathname: "/track-on-map", params: { id: params.id } });
  };
  const handleContactSupport = () => {
    router.push("/help-support");
  };
  const handleAction = (workflowId: string) => {
    router.push({
      pathname: "/workflow",
      params: { workflowId, deliveryId: delivery.id },
    });
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

        {/* Exception banner — why a returning / failed / returned delivery ended */}
        {meta?.exception && (
          <View
            style={[
              styles.exceptionBanner,
              { backgroundColor: meta.bg, borderColor: meta.color },
            ]}
          >
            <MaterialIcons
              name={
                meta.kind === "failed"
                  ? "error-outline"
                  : meta.kind === "returned"
                    ? "home"
                    : "undo"
              }
              size={22}
              color={meta.color}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.exceptionTitle, { color: meta.color }]}>
                {delivery.status}
              </Text>
              {exceptionNote && (
                <Text style={styles.exceptionText}>{exceptionNote}</Text>
              )}
            </View>
          </View>
        )}

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

          <InfoItem
            icon="payments"
            iconType="Material"
            label="Payment"
            value={`${paymentLabel} • $${paymentAmount.toFixed(2)}`}
            color={paymentColor}
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
                // On an exception (returning/failed/returned) NO step is "current":
                // the red/amber banner above carries the narrative, and marking a
                // happy-path step "current" would show a misleading blue in-progress
                // dot AND surface its action button (e.g. "Unload Package" on a
                // failed delivery). StepItem gates its action on state==="current".
                const state: "done" | "current" | "upcoming" = meta?.exception
                  ? index < CURRENT_STEP_INDEX
                    ? "done"
                    : "upcoming"
                  : index < CURRENT_STEP_INDEX
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
                    onAction={handleAction}
                    // At AWAITING_HANDOFF the confirm card below is the single primary
                    // action — suppress the step's "Unload Package" workflow CTA.
                    hideAction={
                      apiDelivery.status === "AWAITING_HANDOFF" &&
                      index === CURRENT_STEP_INDEX
                    }
                  />
                );
              })}
            </View>
          </View>
        </View>

        {/* Recipient handoff — finalize the delivery with the 6-digit code */}
        {apiDelivery.status === "AWAITING_HANDOFF" && (
          <HandoffConfirmCard
            deliveryId={apiDelivery.id}
            toAddress={apiDelivery.toAddress}
            onConfirmed={refetch}
          />
        )}

        {/* Proof of Delivery */}
        {proof && (
          <View style={styles.proofCard}>
            <View style={styles.proofHeader}>
              <MaterialIcons name="verified" size={18} color={colors.success} />
              <Text style={styles.proofTitle}>Proof of Delivery</Text>
            </View>
            <Image
              source={{ uri: proof.photoUrl }}
              style={styles.proofPhoto}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.proofMetaRow}>
              <MaterialIcons name="schedule" size={14} color={colors.text.placeholder} />
              <Text style={styles.proofMetaText}>
                Delivered {new Date(proof.capturedAt).toLocaleString()}
              </Text>
            </View>
            {!!proof.recipientName && (
              <View style={styles.proofMetaRow}>
                <MaterialIcons name="person" size={14} color={colors.text.placeholder} />
                <Text style={styles.proofMetaText}>Received by {proof.recipientName}</Text>
              </View>
            )}
            {proof.lat != null && proof.lng != null && (
              <View style={styles.proofMetaRow}>
                <MaterialIcons name="location-on" size={14} color={colors.text.placeholder} />
                <Text style={styles.proofMetaText}>
                  {proof.lat.toFixed(5)}, {proof.lng.toFixed(5)}
                </Text>
              </View>
            )}
            {!!proof.notes && (
              <Text style={styles.proofNotes}>“{proof.notes}”</Text>
            )}
            <TouchableOpacity
              style={styles.proofPhotoButton}
              onPress={() =>
                router.push({
                  pathname: "/capture-proof",
                  params: { id: params.id },
                })
              }
              activeOpacity={0.8}
            >
              <MaterialIcons name="photo-camera" size={16} color={colors.primary.DEFAULT} />
              <Text style={styles.proofPhotoButtonText}>Take delivery photo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Rate the delivery — available once it has been delivered */}
        {apiDelivery.status === "DELIVERED" && (
          <RateDeliverySheet deliveryId={apiDelivery.id} />
        )}

        {/* Footer Actions */}
        <FooterActions
          onTrackMap={handleTrackMap}
          onContactSupport={handleContactSupport}
        />

        {/* Cancel delivery (only while pending/confirmed) */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={canceling}
            activeOpacity={0.8}
          >
            {canceling ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <MaterialIcons name="cancel" size={18} color="#EF4444" />
                <Text style={styles.cancelButtonText}>Cancel Delivery</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Order again — clone a settled delivery into a fresh one */}
        {meta?.terminal && (
          <TouchableOpacity
            style={styles.reorderButton}
            onPress={handleReorder}
            disabled={reordering}
            activeOpacity={0.85}
          >
            {reordering ? (
              <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
            ) : (
              <>
                <MaterialIcons
                  name="replay"
                  size={18}
                  color={colors.primary.DEFAULT}
                />
                <Text style={styles.reorderButtonText}>Order again</Text>
              </>
            )}
          </TouchableOpacity>
        )}
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
  exceptionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  exceptionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  exceptionText: {
    fontSize: 13,
    color: colors.text.light,
    marginTop: 2,
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
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    backgroundColor: "#F0FDFA",
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  proofCard: {
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
    gap: spacing.sm,
  },
  proofHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  proofPhoto: {
    width: "100%",
    height: 180,
    borderRadius: borderRadius.lg,
    backgroundColor: "#F1F5F9",
    marginBottom: spacing.xs,
  },
  proofMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  proofMetaText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  proofNotes: {
    fontSize: 13,
    fontStyle: "italic",
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  proofPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    backgroundColor: "#F0FDFA",
  },
  proofPhotoButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
});
