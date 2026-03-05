import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { commonStyles } from "@/styles/common";
import type {
  CreateDeliveryFormData,
  FormErrors,
  PackageType,
} from "./CreateDeliveryScreen.types";
import { styles } from "./CreateDeliveryScreen.styles";
import {
  FormHeader,
  InputField,
  FormSection,
  PackageSizeSelector,
  SwapButton,
  DateTimeRow,
  SubmitButton,
  PackageTypeSelector,
  LocationPickerField,
} from "./components";

// Package types options
const PACKAGE_TYPES: PackageType[] = [
  { id: "food", label: "Food", icon: "restaurant" },
  { id: "document", label: "Document", icon: "description" },
  { id: "fragile", label: "Fragile", icon: "wine-bar" },
  { id: "electronics", label: "Electronics", icon: "devices" },
  { id: "clothing", label: "Clothing", icon: "checkroom" },
  { id: "healthcare", label: "Healthcare", icon: "medical-services" },
  { id: "other", label: "Other", icon: "category" },
];

// Package size options
const PACKAGE_SIZES = ["Small", "Medium", "Large", "XL"] as const;

export function CreateDeliveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<CreateDeliveryFormData>({
    from: "",
    to: "",
    receiver: "",
    packages: "",
    packageSize: "",
    packageWeight: "",
    pickupDate: "",
    pickupTime: "",
    packageTypes: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const updateField = <K extends keyof CreateDeliveryFormData>(
    field: K,
    value: CreateDeliveryFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const togglePackageType = (typeId: string) => {
    const updated = formData.packageTypes.includes(typeId)
      ? formData.packageTypes.filter((t) => t !== typeId)
      : [...formData.packageTypes, typeId];
    updateField("packageTypes", updated);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.from.trim()) newErrors.from = "Pickup location is required";
    if (!formData.to.trim()) newErrors.to = "Destination is required";
    if (!formData.receiver.trim())
      newErrors.receiver = "Receiver name is required";
    if (!formData.packages.trim())
      newErrors.packages = "Package description is required";
    if (!formData.packageSize)
      newErrors.packageSize = "Package size is required";
    if (!formData.packageWeight.trim())
      newErrors.packageWeight = "Package weight is required";
    if (!formData.pickupDate) newErrors.pickupDate = "Pickup date is required";
    if (!formData.pickupTime) newErrors.pickupTime = "Pickup time is required";
    if (formData.packageTypes.length === 0)
      newErrors.packageTypes = "Select at least one package type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: "/delivery-confirmation",
        params: {
          from: formData.from,
          to: formData.to,
          receiver: formData.receiver,
          packages: formData.packages,
          packageSize: formData.packageSize,
          packageWeight: formData.packageWeight,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
          packageTypes: JSON.stringify(formData.packageTypes),
        },
      });
    }, 600);
  };

  const handleSwap = () => {
    setFormData((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  };

  const handleBack = () => router.back();

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
        {/* Header */}
        <FormHeader title="New Delivery" onBack={handleBack} />

        {/* Form Card */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.formCard}
        >
          {/* Location Section */}
          <FormSection title="Location" icon="location-on">
            <LocationPickerField
              label="From"
              placeholder="Select pickup location"
              value={formData.from}
              error={errors.from}
              onChange={(v) => updateField("from", v)}
              editable={!loading}
            />

            <SwapButton onPress={handleSwap} />

            <LocationPickerField
              label="To"
              placeholder="Select destination"
              value={formData.to}
              error={errors.to}
              onChange={(v) => updateField("to", v)}
              editable={!loading}
            />
          </FormSection>

          {/* Receiver Info */}
          <FormSection title="Receiver Information" icon="person">
            <InputField
              label="Receiver Name"
              icon="person"
              placeholder="Enter receiver name"
              value={formData.receiver}
              error={errors.receiver}
              onChangeText={(v) => updateField("receiver", v)}
              editable={!loading}
            />
          </FormSection>

          {/* Package Details */}
          <FormSection title="Package Details" icon="inventory-2">
            <InputField
              label="Packages Description"
              icon="description"
              placeholder="Describe your packages"
              value={formData.packages}
              error={errors.packages}
              onChangeText={(v) => updateField("packages", v)}
              editable={!loading}
            />

            <PackageSizeSelector
              sizes={PACKAGE_SIZES}
              selected={formData.packageSize}
              onSelect={(size) => updateField("packageSize", size)}
              error={errors.packageSize}
            />

            <InputField
              label="Package Weight"
              icon="scale"
              placeholder="e.g., 0.5 kg (max 5 kg)"
              value={formData.packageWeight}
              error={errors.packageWeight}
              onChangeText={(v) => updateField("packageWeight", v)}
              editable={!loading}
              keyboardType="decimal-pad"
            />
          </FormSection>

          {/* Package Types */}
          <FormSection title="Package Type" icon="category">
            <PackageTypeSelector
              types={PACKAGE_TYPES}
              selected={formData.packageTypes}
              onSelect={togglePackageType}
            />
            {errors.packageTypes && (
              <Text style={styles.errorText}>{errors.packageTypes}</Text>
            )}
          </FormSection>

          {/* Pickup Schedule */}
          <FormSection title="Pickup Schedule" icon="schedule">
            <DateTimeRow
              dateProps={{
                label: "Date",
                placeholder: "Select date",
                value: formData.pickupDate,
                error: errors.pickupDate,
                onChangeText: (v) => updateField("pickupDate", v),
                editable: !loading,
              }}
              timeProps={{
                label: "Time",
                placeholder: "Select time",
                value: formData.pickupTime,
                error: errors.pickupTime,
                onChangeText: (v) => updateField("pickupTime", v),
                editable: !loading,
              }}
            />
          </FormSection>

          {/* Submit Button */}
          <SubmitButton onPress={handleSubmit} loading={loading} />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
