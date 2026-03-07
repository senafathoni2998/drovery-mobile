import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Types ─────────────────────────────────────────────────────────────────────

type CardNetwork = "visa" | "mastercard" | "amex" | "other";

interface PaymentMethod {
  id: string;
  network: CardNetwork;
  last4: string;
  holderName: string;
  expiry: string;
  isDefault: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const NETWORK_COLORS: Record<CardNetwork, [string, string]> = {
  visa: ["#1A1F71", "#2563EB"],
  mastercard: ["#EB001B", "#F79E1B"],
  amex: ["#007BC1", "#00ADE0"],
  other: ["#475569", "#64748B"],
};

const NETWORK_LABEL: Record<CardNetwork, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  other: "Card",
};

function detectNetwork(number: string): CardNetwork {
  const clean = number.replace(/\s/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  return "other";
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: "1", network: "visa", last4: "4242", holderName: "Sena", expiry: "12/26", isDefault: true },
    { id: "2", network: "mastercard", last4: "5353", holderName: "Sena", expiry: "08/25", isDefault: false },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSetDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert("Remove Card", "Are you sure you want to remove this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () =>
          setMethods((prev) => {
            const filtered = prev.filter((m) => m.id !== id);
            // if deleted card was default, set first remaining as default
            if (filtered.length > 0 && !filtered.some((m) => m.isDefault)) {
              filtered[0].isDefault = true;
            }
            return filtered;
          }),
      },
    ]);
  };

  const handleAddCard = () => {
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.length < 16 || !holderName.trim() || expiry.length < 5 || cvv.length < 3) {
      Alert.alert("Incomplete", "Please fill in all card details correctly.");
      return;
    }
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      network: detectNetwork(digits),
      last4: digits.slice(-4),
      holderName: holderName.trim(),
      expiry,
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newMethod]);
    setShowModal(false);
    setCardNumber("");
    setHolderName("");
    setExpiry("");
    setCvv("");
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Payment Methods</Text>
        <View style={s.headerDecor} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cards ── */}
        {methods.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={s.emptyState}>
            <MaterialIcons name="credit-card-off" size={48} color={colors.text.placeholder} />
            <Text style={s.emptyTitle}>No cards added</Text>
            <Text style={s.emptySubtitle}>Add a card to pay for your deliveries</Text>
          </Animated.View>
        ) : (
          methods.map((method, index) => (
            <Animated.View
              key={method.id}
              entering={FadeInRight.delay(index * 80).duration(400)}
            >
              <CardTile
                method={method}
                onSetDefault={() => handleSetDefault(method.id)}
                onDelete={() => handleDelete(method.id)}
              />
            </Animated.View>
          ))
        )}

        {/* ── Add card button ── */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <TouchableOpacity style={s.addButton} onPress={() => setShowModal(true)} activeOpacity={0.85}>
            <MaterialIcons name="add" size={20} color={colors.primary.DEFAULT} />
            <Text style={s.addButtonText}>Add New Card</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* ── Add card modal ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={[s.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Add New Card</Text>

            <ModalField
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              keyboardType="number-pad"
              icon="credit-card"
            />
            <ModalField
              label="Cardholder Name"
              placeholder="Name on card"
              value={holderName}
              onChangeText={setHolderName}
              icon="person"
            />
            <View style={s.modalRow}>
              <View style={s.modalHalf}>
                <ModalField
                  label="Expiry"
                  placeholder="MM/YY"
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  keyboardType="number-pad"
                  icon="calendar-today"
                />
              </View>
              <View style={s.modalHalf}>
                <ModalField
                  label="CVV"
                  placeholder="•••"
                  value={cvv}
                  onChangeText={(v) => setCvv(v.replace(/\D/g, "").slice(0, 4))}
                  keyboardType="number-pad"
                  icon="lock"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={s.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.confirmButton} onPress={handleAddCard} activeOpacity={0.85}>
                <MaterialIcons name="check" size={18} color={colors.white} />
                <Text style={s.confirmButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── CardTile ──────────────────────────────────────────────────────────────────

function CardTile({
  method,
  onSetDefault,
  onDelete,
}: {
  method: PaymentMethod;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.cardWrapper}>
      <LinearGradient
        colors={NETWORK_COLORS[method.network]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.card}
      >
        <View style={s.cardTop}>
          <Text style={s.cardNetwork}>{NETWORK_LABEL[method.network]}</Text>
          {method.isDefault && (
            <View style={s.defaultBadge}>
              <Text style={s.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={s.cardNumber}>•••• •••• •••• {method.last4}</Text>
        <View style={s.cardBottom}>
          <View>
            <Text style={s.cardMeta}>CARDHOLDER</Text>
            <Text style={s.cardMetaValue}>{method.holderName}</Text>
          </View>
          <View>
            <Text style={s.cardMeta}>EXPIRES</Text>
            <Text style={s.cardMetaValue}>{method.expiry}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={s.cardActions}>
        {!method.isDefault && (
          <TouchableOpacity style={s.actionButton} onPress={onSetDefault}>
            <MaterialIcons name="check-circle-outline" size={18} color={colors.primary.DEFAULT} />
            <Text style={[s.actionText, { color: colors.primary.DEFAULT }]}>Set as default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[s.actionButton, s.actionButtonDelete]} onPress={onDelete}>
          <MaterialIcons name="delete-outline" size={18} color={colors.error} />
          <Text style={[s.actionText, { color: colors.error }]}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── ModalField ────────────────────────────────────────────────────────────────

function ModalField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  icon,
  secureTextEntry = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "default" | "number-pad" | "email-address";
  icon: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View style={s.fieldWrapper}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={s.fieldRow}>
        <MaterialIcons name={icon as any} size={16} color={colors.text.placeholder} style={s.fieldIcon} />
        <TextInput
          style={s.fieldInput}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    overflow: "hidden",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.xxl,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.white,
    marginLeft: spacing.md,
  },
  headerDecor: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.placeholder,
    textAlign: "center",
  },
  // Card
  cardWrapper: {
    gap: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardNetwork: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: 1,
  },
  defaultBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  defaultBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.white,
  },
  cardNumber: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.white,
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardMeta: {
    fontSize: 9,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardMetaValue: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.white,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  actionButtonDelete: {
    borderColor: "#FCA5A5",
    backgroundColor: "#FFF5F5",
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  // Add button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    borderStyle: "dashed",
    paddingVertical: spacing.md,
    backgroundColor: "#F0FDFA",
  },
  addButtonText: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.focus,
    alignSelf: "center",
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text.primary,
  },
  modalRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  modalHalf: {
    flex: 1,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  cancelButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  confirmButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.DEFAULT,
  },
  confirmButtonText: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: colors.white,
  },
  // Field
  fieldWrapper: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing.md,
    height: 46,
  },
  fieldIcon: {
    marginRight: spacing.sm,
  },
  fieldInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
});
