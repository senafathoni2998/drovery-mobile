import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FormHeader,
  FormSection,
  InputField,
  LocationPickerField,
  PackageSizeSelector,
  PackageTypeSelector,
  SwapButton,
} from "../CreateDeliveryScreen/components";
import { styles as formStyles } from "../CreateDeliveryScreen/CreateDeliveryScreen.styles";
import type { PackageType } from "../CreateDeliveryScreen/CreateDeliveryScreen.types";
import { MAX_WEIGHT_KG } from "../CreateDeliveryScreen/validators";
import { pricingApi } from "../../services/pricingApi";
import type { PriceEstimate } from "@/services/api/types";
import {
  calcBreakdownLocal,
  WEIGHT_RATE,
  type PriceEstimationFormData,
} from "./pricing";

// ── Constants ─────────────────────────────────────────────────────────────────

const PACKAGE_TYPES: PackageType[] = [
  { id: "food", label: "Food", icon: "restaurant" },
  { id: "document", label: "Document", icon: "description" },
  { id: "fragile", label: "Fragile", icon: "wine-bar" },
  { id: "electronics", label: "Electronics", icon: "devices" },
  { id: "clothing", label: "Clothing", icon: "checkroom" },
  { id: "healthcare", label: "Healthcare", icon: "medical-services" },
  { id: "other", label: "Other", icon: "category" },
];

const PACKAGE_SIZES = ["Small", "Medium", "Large", "XL"] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function PriceEstimationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { control, getValues, setValue } = useForm<PriceEstimationFormData>({
    defaultValues: {
      from: "",
      to: "",
      packageSize: "",
      packageWeight: "",
      packageTypes: [],
    },
  });

  const watched = useWatch({ control });
  const [apiBreakdown, setApiBreakdown] = useState<PriceEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);

  // Use API breakdown if available, otherwise local fallback
  const breakdown = apiBreakdown ?? calcBreakdownLocal({
    from: watched.from ?? "",
    to: watched.to ?? "",
    packageSize: watched.packageSize ?? "",
    packageWeight: watched.packageWeight ?? "",
    packageTypes: watched.packageTypes ?? [],
  });

  // Fetch price from API when size/weight/types or the addresses change.
  // Sending the addresses lets the backend price the flight distance too.
  React.useEffect(() => {
    const size = watched.packageSize;
    const types = watched.packageTypes;
    if (!size || !types?.length) {
      setApiBreakdown(null);
      return;
    }
    const weight = parseFloat(watched.packageWeight ?? "0") || 0;
    setEstimating(true);
    pricingApi
      .estimate({
        packageSize: size,
        packageWeight: weight,
        packageTypes: types,
        fromAddress: watched.from || undefined,
        toAddress: watched.to || undefined,
      })
      .then(setApiBreakdown)
      .catch(() => setApiBreakdown(null))
      .finally(() => setEstimating(false));
  }, [
    watched.packageSize,
    watched.packageWeight,
    watched.packageTypes,
    watched.from,
    watched.to,
  ]);

  const distanceFee =
    apiBreakdown && "distanceFee" in apiBreakdown ? apiBreakdown.distanceFee : 0;
  const distanceKm =
    apiBreakdown && "distanceKm" in apiBreakdown ? apiBreakdown.distanceKm : 0;

  const hasEstimate = !!watched.packageSize;
  const [priceBarHeight, setPriceBarHeight] = useState(80);

  const handleCreateDelivery = () => {
    router.push({
      pathname: "/create-delivery",
      params: {
        from: watched.from ?? "",
        to: watched.to ?? "",
        packageSize: watched.packageSize ?? "",
        packageWeight: watched.packageWeight ?? "",
        packageTypes: JSON.stringify(watched.packageTypes ?? []),
      },
    });
  };

  const handleSwap = () => {
    const { from, to } = getValues();
    setValue("from", to);
    setValue("to", from);
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          formStyles.scrollContent,
          { paddingBottom: priceBarHeight + spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormHeader title="Price Estimation" onBack={() => router.back()} />

        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={formStyles.formCard}
        >
          {/* Location */}
          <FormSection title="Location" icon="location-on">
            <Controller
              control={control}
              name="from"
              render={({ field: { onChange, value } }) => (
                <LocationPickerField
                  label="From"
                  placeholder="Select pickup location"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            <SwapButton onPress={handleSwap} />
            <Controller
              control={control}
              name="to"
              render={({ field: { onChange, value } }) => (
                <LocationPickerField
                  label="To"
                  placeholder="Select destination"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </FormSection>

          {/* Package */}
          <FormSection title="Package" icon="inventory-2">
            <Controller
              control={control}
              name="packageSize"
              render={({ field: { onChange, value } }) => (
                <PackageSizeSelector
                  sizes={PACKAGE_SIZES}
                  selected={value}
                  onSelect={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="packageWeight"
              rules={{
                validate: (value) => {
                  if (!value) return true;
                  const num = parseFloat(value);
                  if (isNaN(num) || num <= 0)
                    return "Enter a valid weight greater than 0";
                  const size = getValues("packageSize");
                  const max = MAX_WEIGHT_KG[size];
                  if (max !== undefined && num > max)
                    return `${num} kg exceeds the ${max} kg limit for ${size} packages`;
                  return true;
                },
              }}
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => (
                <InputField
                  label="Package Weight"
                  icon="scale"
                  placeholder={
                    watched.packageSize
                      ? `Enter weight (max ${MAX_WEIGHT_KG[watched.packageSize ?? ""]} kg)`
                      : "Select a size first"
                  }
                  value={value}
                  error={error?.message}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </FormSection>

          {/* Package Types */}
          <FormSection title="Package Type" icon="category">
            <Controller
              control={control}
              name="packageTypes"
              render={({ field: { onChange, value } }) => (
                <PackageTypeSelector
                  types={PACKAGE_TYPES}
                  selected={value}
                  onSelect={(typeId) => {
                    const updated = value.includes(typeId)
                      ? value.filter((t) => t !== typeId)
                      : [...value, typeId];
                    onChange(updated);
                  }}
                />
              )}
            />
          </FormSection>
        </Animated.View>
      </ScrollView>

      {/* ── Price breakdown bar ── */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(400)}
        style={[s.priceBar, { paddingBottom: insets.bottom + spacing.md }]}
        onLayout={(e) => setPriceBarHeight(e.nativeEvent.layout.height)}
      >
        {hasEstimate ? (
          <>
            <View style={s.breakdownRows}>
              <BreakdownRow label="Base fee" value={breakdown.baseFee} />
              <BreakdownRow
                label={`Size (${watched.packageSize})`}
                value={breakdown.sizeFee}
              />
              {breakdown.weightFee > 0 && (
                <BreakdownRow
                  label={`Weight (${watched.packageWeight} kg × $${WEIGHT_RATE})`}
                  value={breakdown.weightFee}
                />
              )}
              {breakdown.typeFee > 0 && (
                <BreakdownRow
                  label="Type surcharge"
                  value={breakdown.typeFee}
                />
              )}
              {distanceFee > 0 && (
                <BreakdownRow
                  label={`Distance (${distanceKm.toFixed(1)} km)`}
                  value={distanceFee}
                />
              )}
              <View style={s.totalDivider} />
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Estimated Total</Text>
                <Text style={s.totalValue}>${breakdown.total.toFixed(2)}</Text>
              </View>
            </View>

            <LinearGradient
              colors={["#F0FDFA", "#E0F2FE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.totalBadge}
            >
              <MaterialIcons
                name="payments"
                size={20}
                color={colors.primary.DEFAULT}
              />
              <Text style={s.totalBadgeText}>
                ${breakdown.total.toFixed(2)}
              </Text>
            </LinearGradient>
            <TouchableOpacity
              style={s.createButton}
              onPress={handleCreateDelivery}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name="local-shipping"
                size={18}
                color={colors.white}
              />
              <Text style={s.createButtonText}>Create Delivery</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={s.emptyEstimate}>
            <MaterialIcons
              name="calculate"
              size={20}
              color={colors.text.placeholder}
            />
            <Text style={s.emptyEstimateText}>
              Select a package size to see the estimate
            </Text>
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

// ── Breakdown row ─────────────────────────────────────────────────────────────

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.breakdownRow}>
      <Text style={s.breakdownLabel}>{label}</Text>
      <Text style={s.breakdownValue}>${value.toFixed(2)}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  priceBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
    gap: spacing.md,
  },
  breakdownRows: {
    gap: spacing.xs,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLabel: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  breakdownValue: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.primary,
  },
  totalDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.xs,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.primary,
  },
  totalValue: {
    fontSize: fontSize["2xl"],
    fontWeight: "800",
    color: colors.text.primary,
  },
  totalBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },
  totalBadgeText: {
    fontSize: fontSize["2xl"],
    fontWeight: "800",
    color: colors.primary.DEFAULT,
  },
  emptyEstimate: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  emptyEstimateText: {
    fontSize: fontSize.base,
    color: colors.text.placeholder,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
  },
  createButtonText: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: colors.white,
  },
});
