import React, { useEffect, useState } from "react";
import { Share, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { borderRadius, colors, spacing } from "@/styles/common";
import { getHandoffCode } from "../../../services/handoffCodeStore";

interface SenderHandoffCodeCardProps {
  deliveryId: string;
  receiver?: string;
}

/**
 * Sender-side handoff-code card. The one-time code is shown once at create time and
 * then only ever lives in this device's keychain (the server never returns it again),
 * so the sender previously had no way to re-read it after leaving the success screen.
 * This card re-reveals it — with a native Share action — at any point before drop-off.
 * Renders NOTHING when there's no cached code (a different device, or already settled),
 * so the caller can mount it unconditionally for a non-terminal delivery.
 */
export function SenderHandoffCodeCard({
  deliveryId,
  receiver,
}: SenderHandoffCodeCardProps) {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getHandoffCode(deliveryId)
      .then((c) => {
        if (active) setCode(c);
      })
      .catch(() => {
        if (active) setCode(null);
      });
    return () => {
      active = false;
    };
  }, [deliveryId]);

  if (!code) return null;

  const onShare = () => {
    void Share.share({
      message: `Your Drovery handoff code is ${code}. Read it to the drone at drop-off to release the package.`,
    }).catch(() => undefined);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialIcons name="vpn-key" size={18} color={colors.primary.DEFAULT} />
        <Text style={styles.title}>Your handoff code</Text>
      </View>

      <Text selectable style={styles.code} accessibilityLabel={`Handoff code ${code}`}>
        {code}
      </Text>

      <Text style={styles.body}>
        Share this with {receiver || "your recipient"} — the drone asks for it at
        drop-off to release your package. Long-press to copy.
      </Text>

      <TouchableOpacity
        style={styles.shareBtn}
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel="Share handoff code"
      >
        <MaterialIcons name="share" size={16} color={colors.primary.DEFAULT} />
        <Text style={styles.shareText}>Share with recipient</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.xxl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  code: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 6,
    textAlign: "center",
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 13,
    color: colors.text.light,
    lineHeight: 18,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
  },
  shareText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary.DEFAULT,
  },
});
