import { commonStyles } from "@/styles/common";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./CreateDeliveryScreen.styles";
import type {
  CreateDeliveryFormData,
  PackageType,
} from "./CreateDeliveryScreen.types";
import {
  DateTimePickerField,
  FormHeader,
  FormSection,
  InputField,
  LocationPickerField,
  PackageSizeSelector,
  PackageTypeSelector,
  SubmitButton,
  SwapButton,
} from "./components";

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

// TODO: replace with value from user profile store
const USER_DEFAULT_ADDRESS =
  "Jalan Ahmad Yani 1 No. 77 RT 12 RW 13, Tanjung Duren, Jakarta";

const MAX_WEIGHT_KG: Record<string, number> = {
  Small: 0.5,
  Medium: 1.5,
  Large: 3,
  XL: 5,
};

export function CreateDeliveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CreateDeliveryFormData>({
    defaultValues: {
      from: "",
      to: "",
      receiver: "",
      packages: "",
      packageSize: "",
      packageWeight: "",
      pickupDate: "",
      pickupTime: "",
      packageTypes: [],
    },
    mode: "onTouched",
  });

  const selectedSize = watch("packageSize");

  const handleSwap = () => {
    const { from, to } = getValues();
    setValue("from", to, { shouldValidate: true });
    setValue("to", from, { shouldValidate: true });
  };

  const onSubmit = (data: CreateDeliveryFormData) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: "/delivery-confirmation",
        params: {
          from: data.from,
          to: data.to,
          receiver: data.receiver,
          packages: data.packages,
          packageSize: data.packageSize,
          packageWeight: data.packageWeight,
          pickupDate: data.pickupDate,
          pickupTime: data.pickupTime,
          packageTypes: JSON.stringify(data.packageTypes),
        },
      });
    }, 600);
  };

  const validateWeight = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return "Enter a valid weight greater than 0";
    const size = getValues("packageSize");
    const max = MAX_WEIGHT_KG[size];
    if (max !== undefined && num > max)
      return `${num} kg exceeds the ${max} kg limit for ${size} packages`;
    return true;
  };

  const validatePickupDate = (value: string) => {
    const selected = new Date(value);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (selected < today) return "Pickup date cannot be in the past";
    return true;
  };

  const validatePickupTime = (value: string) => {
    const dateStr = getValues("pickupDate");
    if (!dateStr) return true;

    const selected = new Date(dateStr);
    const today = new Date();
    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (selected.getTime() !== today.getTime()) return true;

    const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return true;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const isPm = match[3].toUpperCase() === "PM";
    if (isPm && hours !== 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;

    const now = new Date();
    const pickedTime = new Date();
    pickedTime.setHours(hours, minutes, 0, 0);

    if (pickedTime <= now)
      return "Pickup time must be later than the current time";
    return true;
  };

  return (
    <KeyboardAvoidingView
      style={[commonStyles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <FormHeader title="New Delivery" onBack={() => router.back()} />

        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.formCard}
        >
          {/* Location */}
          <FormSection title="Location" icon="location-on">
            <Controller
              control={control}
              name="from"
              rules={{ required: "Pickup location is required" }}
              render={({ field: { onChange, value } }) => (
                <LocationPickerField
                  label="From"
                  placeholder="Select pickup location"
                  value={value}
                  error={errors.from?.message}
                  onChange={onChange}
                  editable={!loading}
                  userAddress={USER_DEFAULT_ADDRESS}
                />
              )}
            />

            <SwapButton onPress={handleSwap} />

            <Controller
              control={control}
              name="to"
              rules={{ required: "Destination is required" }}
              render={({ field: { onChange, value } }) => (
                <LocationPickerField
                  label="To"
                  placeholder="Select destination"
                  value={value}
                  error={errors.to?.message}
                  onChange={onChange}
                  editable={!loading}
                  userAddress={USER_DEFAULT_ADDRESS}
                />
              )}
            />
          </FormSection>

          {/* Receiver Info */}
          <FormSection title="Receiver Information" icon="person">
            <Controller
              control={control}
              name="receiver"
              rules={{ required: "Receiver name is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Receiver Name"
                  icon="person"
                  placeholder="Enter receiver name"
                  value={value}
                  error={errors.receiver?.message}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!loading}
                />
              )}
            />
          </FormSection>

          {/* Package Details */}
          <FormSection title="Package Details" icon="inventory-2">
            <Controller
              control={control}
              name="packages"
              rules={{ required: "Package description is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Packages Description"
                  icon="description"
                  placeholder="Describe your packages"
                  value={value}
                  error={errors.packages?.message}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!loading}
                />
              )}
            />

            <Controller
              control={control}
              name="packageSize"
              rules={{ required: "Package size is required" }}
              render={({ field: { onChange, value } }) => (
                <PackageSizeSelector
                  sizes={PACKAGE_SIZES}
                  selected={value}
                  onSelect={onChange}
                  error={errors.packageSize?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="packageWeight"
              rules={{
                required: "Package weight is required",
                validate: validateWeight,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <InputField
                  label="Package Weight"
                  icon="scale"
                  placeholder={
                    selectedSize
                      ? `Enter weight (max ${MAX_WEIGHT_KG[selectedSize]} kg)`
                      : "Select a size first"
                  }
                  value={value}
                  error={errors.packageWeight?.message}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!loading}
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
              rules={{
                validate: (v) =>
                  v.length > 0 || "Select at least one package type",
              }}
              render={({ field: { onChange, value } }) => (
                <>
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
                  {errors.packageTypes && (
                    <Text style={styles.errorText}>
                      {errors.packageTypes.message}
                    </Text>
                  )}
                </>
              )}
            />
          </FormSection>

          {/* Pickup Schedule */}
          <FormSection title="Pickup Schedule" icon="schedule">
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="pickupDate"
                  rules={{
                    required: "Pickup date is required",
                    validate: validatePickupDate,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <DateTimePickerField
                      mode="date"
                      icon="calendar-month"
                      label="Date"
                      placeholder="Select date"
                      value={value}
                      error={errors.pickupDate?.message}
                      onChange={(v) => {
                        onChange(v);
                        // re-validate time whenever date changes
                        if (getValues("pickupTime")) trigger("pickupTime");
                      }}
                      editable={!loading}
                    />
                  )}
                />
              </View>
              <View style={styles.halfWidth}>
                <Controller
                  control={control}
                  name="pickupTime"
                  rules={{
                    required: "Pickup time is required",
                    validate: validatePickupTime,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <DateTimePickerField
                      mode="time"
                      icon="schedule"
                      label="Time"
                      placeholder="Select time"
                      value={value}
                      error={errors.pickupTime?.message}
                      onChange={onChange}
                      editable={!loading}
                    />
                  )}
                />
              </View>
            </View>
          </FormSection>

          <SubmitButton onPress={handleSubmit(onSubmit)} loading={loading} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
