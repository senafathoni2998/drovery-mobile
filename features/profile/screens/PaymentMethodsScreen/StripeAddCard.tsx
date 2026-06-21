import { MaterialIcons } from "@expo/vector-icons";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { ENV } from "@/config/env";
import { paymentApi } from "@/features/profile/services/paymentApi";

function CardSetupButton({ onAdded }: { onAdded: () => void }) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const handleAddCard = async () => {
    setLoading(true);
    try {
      const session = await paymentApi.setupIntent();
      if (session.mock || !session.setupIntentClientSecret) {
        Alert.alert(
          "Stripe not configured",
          "The backend has no Stripe key set, so card entry runs in mock mode. Use the manual form for now.",
        );
        return;
      }

      const init = await initPaymentSheet({
        merchantDisplayName: "Drovery",
        customerId: session.customerId,
        customerEphemeralKeySecret: session.ephemeralKeySecret ?? undefined,
        setupIntentClientSecret: session.setupIntentClientSecret,
        allowsDelayedPaymentMethods: false,
      });
      if (init.error) throw new Error(init.error.message);

      const result = await presentPaymentSheet();
      if (result.error) {
        if (result.error.code !== "Canceled") {
          Alert.alert("Card not added", result.error.message);
        }
        return;
      }

      await paymentApi.sync();
      onAdded();
      Alert.alert("Card added", "Your card was saved securely with Stripe.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not add the card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleAddCard}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          <MaterialIcons name="lock" size={18} color="#fff" />
          <Text style={styles.buttonText}>Add card with Stripe</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

/**
 * Renders the native Stripe card-entry button — only when a publishable key is
 * configured (`EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`). Otherwise renders nothing
 * and the screen's manual card form is used.
 */
export function StripeAddCard({ onAdded }: { onAdded: () => void }) {
  if (!ENV.STRIPE_PUBLISHABLE_KEY) return null;
  return (
    <StripeProvider publishableKey={ENV.STRIPE_PUBLISHABLE_KEY}>
      <CardSetupButton onAdded={onAdded} />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.DEFAULT,
  },
  buttonText: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: "#fff",
  },
});
