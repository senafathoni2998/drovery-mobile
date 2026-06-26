import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { colors, spacing } from "@/styles/common";
import { workflowApi } from "@/features/delivery/services/workflowApi";
import type { QRDisplayStepData } from "../../../workflow/types";

interface Props {
  step: QRDisplayStepData;
  deliveryId?: string;
}

export function QRDisplayStep({ step, deliveryId }: Props) {
  // Fetch the backend-signed handoff payload and render it as a real, scannable QR.
  const [payload, setPayload] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!deliveryId) return;
    let active = true;
    setPayload(null);
    setFailed(false);
    workflowApi
      .generateQR(deliveryId)
      .then((res) => {
        if (active) setPayload(res.payload);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [deliveryId]);

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{step.instruction}</Text>

      <View style={styles.qrWrapper}>
        <View style={styles.qrBox}>
          {/* Corner marks */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          <View style={styles.qrContent}>
            {payload ? (
              <QRCode value={payload} size={170} />
            ) : failed ? (
              <Ionicons name="qr-code" size={120} color={colors.text.primary} />
            ) : (
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
            )}
            {deliveryId && (
              <Text style={styles.deliveryId}>{deliveryId}</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={16} color={colors.text.placeholder} />
        <Text style={styles.hint}>{step.hint}</Text>
      </View>
    </View>
  );
}

const CORNER = 20;
const CORNER_W = 3;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
    alignItems: "center",
  },
  instruction: {
    fontSize: 14,
    color: colors.text.light,
    lineHeight: 22,
    textAlign: "center",
  },
  qrWrapper: {
    padding: spacing.lg,
  },
  qrBox: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: colors.primary.DEFAULT,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_W,
    borderLeftWidth: CORNER_W,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_W,
    borderRightWidth: CORNER_W,
    borderBottomRightRadius: 4,
  },
  qrContent: {
    alignItems: "center",
    gap: spacing.sm,
  },
  deliveryId: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.muted,
    letterSpacing: 1,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  hint: {
    flex: 1,
    fontSize: 12,
    color: colors.text.placeholder,
    lineHeight: 18,
  },
});
