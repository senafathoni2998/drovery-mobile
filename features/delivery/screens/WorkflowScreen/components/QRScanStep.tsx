import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing } from "@/styles/common";
import type { QRScanStepData } from "../../../workflow/types";

interface Props {
  step: QRScanStepData;
  onScanned: () => void; // called when QR is successfully scanned
}

export function QRScanStep({ step, onScanned }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setScanning(false);
    onScanned();
  };

  if (scanning) {
    if (!permission?.granted) {
      requestPermission();
      return null;
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
        {/* Viewfinder overlay */}
        <View style={styles.cameraOverlay}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.cameraHint}>Point at the drone's QR code</Text>
        </View>
        <TouchableOpacity
          style={styles.cancelScan}
          onPress={() => setScanning(false)}
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.cancelScanText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>{step.instruction}</Text>

      {scanned ? (
        // Success state
        <View style={styles.successBox}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={40} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>QR Code Scanned!</Text>
          <Text style={styles.successDesc}>
            Drone identity verified. Press the button below to continue.
          </Text>
          <TouchableOpacity
            style={styles.rescanButton}
            onPress={() => {
              setScanned(false);
              setScanning(true);
            }}
          >
            <Text style={styles.rescanText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Idle state — prompt to scan
        <View style={styles.scanPrompt}>
          <View style={styles.scanIconWrapper}>
            <Ionicons name="qr-code-outline" size={52} color={colors.primary.DEFAULT} />
          </View>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={async () => {
              if (!permission?.granted) {
                const result = await requestPermission();
                if (!result.granted) return;
              }
              setScanning(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.scanButtonText}>Open Scanner</Text>
          </TouchableOpacity>
          <View style={styles.hintRow}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={colors.text.placeholder}
            />
            <Text style={styles.hint}>{step.hint}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const VF = 180;
const CW = 18;
const CB = 3;

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  instruction: {
    fontSize: 14,
    color: colors.text.light,
    lineHeight: 22,
    textAlign: "center",
  },
  // Camera view
  cameraContainer: {
    height: 300,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xl,
  },
  viewfinder: {
    width: VF,
    height: VF,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CW,
    height: CW,
    borderColor: "#fff",
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CB, borderLeftWidth: CB, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: CB, borderRightWidth: CB, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CB, borderLeftWidth: CB, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CB, borderRightWidth: CB, borderBottomRightRadius: 4 },
  cameraHint: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  cancelScan: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  cancelScanText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  // Idle state
  scanPrompt: {
    alignItems: "center",
    gap: spacing.xl,
  },
  scanIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  hint: {
    flex: 1,
    fontSize: 12,
    color: colors.text.placeholder,
    lineHeight: 18,
    textAlign: "center",
  },
  // Success state
  successBox: {
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.xs,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#166534",
  },
  successDesc: {
    fontSize: 13,
    color: "#15803D",
    textAlign: "center",
    lineHeight: 20,
  },
  rescanButton: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  rescanText: {
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "500",
  },
});
