import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { borderRadius, colors, spacing } from "../../../../styles/common";
import { proofApi } from "../../services/proofApi";

export function ProofCaptureScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [uploading, setUploading] = useState(false);

  const handleCapture = async () => {
    if (!params.id || !cameraRef.current || uploading) return;
    setUploading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.4,
      });

      // Best-effort: stamp the proof with the device's current location.
      let lat: number | undefined;
      let lng: number | undefined;
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.granted) {
          const pos = await Location.getCurrentPositionAsync({});
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        }
      } catch {
        // location is optional
      }

      await proofApi.submit(params.id, {
        photoBase64: photo?.base64 ?? undefined,
        lat,
        lng,
      });
      router.back();
    } catch {
      Alert.alert("Upload failed", "Couldn't save the photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Ionicons name="camera-outline" size={64} color={colors.text.light} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionDesc}>
          Allow camera access to photograph the delivered package as proof.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
      />
      <View style={styles.overlay}>
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Delivery Photo</Text>
          <View style={styles.backButton} />
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Text style={styles.hint}>
            Photograph the delivered package as proof of delivery
          </Text>
          <TouchableOpacity
            style={styles.shutter}
            onPress={handleCapture}
            disabled={uploading}
            activeOpacity={0.8}
          >
            {uploading ? (
              <ActivityIndicator color={colors.primary.DEFAULT} />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  overlay: { flex: 1, justifyContent: "space-between" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 17, fontWeight: "600", color: "#fff" },
  bottomBar: { alignItems: "center", gap: spacing.lg },
  hint: {
    fontSize: 13,
    color: "#fff",
    textAlign: "center",
    paddingHorizontal: spacing.xl,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: "hidden",
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  permissionDesc: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  permissionButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
