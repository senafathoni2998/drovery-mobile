import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing } from "@/styles/common";
import type { QRDisplayStepData } from "../../../workflow/types";

interface Props {
  step: QRDisplayStepData;
  deliveryId?: string;
}

export function QRDisplayStep({ step, deliveryId }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{step.instruction}</Text>

      {/* QR Code placeholder — replace with react-native-qrcode-svg when needed */}
      <View style={styles.qrWrapper}>
        <View style={styles.qrBox}>
          {/* Corner marks */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          <View style={styles.qrContent}>
            <Ionicons name="qr-code" size={120} color={colors.text.primary} />
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
