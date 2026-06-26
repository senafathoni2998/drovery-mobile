import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAddresses } from "@/features/addresses/hooks/useAddresses";
import type { SavedAddress } from "@/features/addresses/services/addressApi";

// ── Component ─────────────────────────────────────────────────────────────────

export function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch, create, update, setDefault, remove } =
    useAddresses();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setLabel("");
    setAddress("");
    setShowModal(true);
  };

  const openEdit = (item: SavedAddress) => {
    setEditing(item);
    setLabel(item.label);
    setAddress(item.address);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setLabel("");
    setAddress("");
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id);
    } catch {
      Alert.alert("Error", "Failed to set default address");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Remove Address",
      "Are you sure you want to remove this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(id);
            } catch {
              Alert.alert("Error", "Failed to remove address");
            }
          },
        },
      ],
    );
  };

  const handleSave = async () => {
    const trimmedLabel = label.trim();
    const trimmedAddress = address.trim();
    if (!trimmedLabel || !trimmedAddress) {
      Alert.alert("Incomplete", "Please enter both a label and an address.");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await update(editing.id, {
          label: trimmedLabel,
          address: trimmedAddress,
        });
      } else {
        await create({ label: trimmedLabel, address: trimmedAddress });
      }
      closeModal();
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to save address");
    } finally {
      setSaving(false);
    }
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
        <Text style={s.headerTitle}>Saved Addresses</Text>
        <View style={s.headerDecor} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.loadingState}>
            <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
          </View>
        ) : error ? (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={s.emptyState}
          >
            <MaterialIcons
              name="error-outline"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>Couldn&apos;t load addresses</Text>
            <Text style={s.emptySubtitle}>{error}</Text>
            <TouchableOpacity style={s.retryButton} onPress={refetch}>
              <MaterialIcons
                name="refresh"
                size={18}
                color={colors.primary.DEFAULT}
              />
              <Text style={s.retryText}>Try again</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : data.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(400)}
            style={s.emptyState}
          >
            <MaterialIcons
              name="location-off"
              size={48}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyTitle}>No saved addresses</Text>
            <Text style={s.emptySubtitle}>
              Save your frequent addresses for faster deliveries
            </Text>
          </Animated.View>
        ) : (
          data.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(index * 80).duration(400)}
            >
              <AddressCard
                item={item}
                onEdit={() => openEdit(item)}
                onSetDefault={() => handleSetDefault(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            </Animated.View>
          ))
        )}

        {/* ── Add address button ── */}
        {!loading && !error && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            style={s.addGroup}
          >
            <TouchableOpacity
              style={s.addButton}
              onPress={openAdd}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={20} color={colors.primary.DEFAULT} />
              <Text style={s.addButtonText}>Add Address</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Add / edit modal ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[s.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}
          >
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>
              {editing ? "Edit Address" : "Add New Address"}
            </Text>

            <ModalField
              label="Label"
              placeholder="e.g. Home, Office"
              value={label}
              onChangeText={setLabel}
              icon="label-outline"
              maxLength={50}
            />
            <ModalField
              label="Address"
              placeholder="Street, city, postal code"
              value={address}
              onChangeText={setAddress}
              icon="place"
              maxLength={500}
              multiline
            />

            <View style={s.modalActions}>
              <TouchableOpacity
                style={s.cancelButton}
                onPress={closeModal}
                disabled={saving}
              >
                <Text style={s.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.confirmButton}
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <MaterialIcons name="check" size={18} color={colors.white} />
                    <Text style={s.confirmButtonText}>
                      {editing ? "Save Changes" : "Add Address"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── AddressCard ───────────────────────────────────────────────────────────────

function AddressCard({
  item,
  onEdit,
  onSetDefault,
  onDelete,
}: {
  item: SavedAddress;
  onEdit: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={s.cardWrapper}>
      <View style={s.card}>
        <View style={s.cardIcon}>
          <MaterialIcons
            name="location-on"
            size={22}
            color={colors.primary.DEFAULT}
          />
        </View>
        <View style={s.cardBody}>
          <View style={s.cardTop}>
            <Text style={s.cardLabel} numberOfLines={1}>
              {item.label}
            </Text>
            {item.isDefault && (
              <View style={s.defaultBadge}>
                <Text style={s.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={s.cardAddress} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
        <TouchableOpacity style={s.editButton} onPress={onEdit}>
          <MaterialIcons
            name="edit"
            size={18}
            color={colors.text.light}
          />
        </TouchableOpacity>
      </View>

      <View style={s.cardActions}>
        {!item.isDefault && (
          <TouchableOpacity style={s.actionButton} onPress={onSetDefault}>
            <MaterialIcons
              name="check-circle-outline"
              size={18}
              color={colors.primary.DEFAULT}
            />
            <Text style={[s.actionText, { color: colors.primary.DEFAULT }]}>
              Set as default
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[s.actionButton, s.actionButtonDelete]}
          onPress={onDelete}
        >
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
  icon,
  maxLength,
  multiline = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  icon: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  return (
    <View style={s.fieldWrapper}>
      <Text style={s.fieldLabel}>{label}</Text>
      <View style={[s.fieldRow, multiline && s.fieldRowMultiline]}>
        <MaterialIcons
          name={icon as any}
          size={16}
          color={colors.text.placeholder}
          style={s.fieldIcon}
        />
        <TextInput
          style={[s.fieldInput, multiline && s.fieldInputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          multiline={multiline}
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
  loadingState: {
    alignItems: "center",
    paddingVertical: spacing.xxxl * 2,
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
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: "#F0FDFA",
  },
  retryText: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  // Card
  cardWrapper: {
    gap: spacing.xs,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.xxl,
    backgroundColor: "#F0FDFA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  cardBody: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardLabel: {
    flexShrink: 1,
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text.primary,
  },
  defaultBadge: {
    backgroundColor: "#CCFBF1",
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#99F6E4",
  },
  defaultBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.primary.dark,
  },
  cardAddress: {
    fontSize: fontSize.base,
    color: colors.text.light,
    lineHeight: 20,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
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
  addGroup: {
    gap: spacing.sm,
  },
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
  fieldRowMultiline: {
    height: undefined,
    minHeight: 64,
    alignItems: "flex-start",
    paddingVertical: spacing.md,
  },
  fieldIcon: {
    marginRight: spacing.sm,
  },
  fieldInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  fieldInputMultiline: {
    textAlignVertical: "top",
  },
});
