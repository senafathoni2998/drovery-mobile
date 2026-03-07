import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, fontSize, spacing } from "@/styles/common";
import { styles } from "../CreateDeliveryScreen.styles";
import { LocationPickerModal } from "./LocationPickerModal";

interface LocationPickerFieldProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  editable?: boolean;
  /** User's saved default address from profile */
  userAddress?: string;
}

export function LocationPickerField({
  label,
  placeholder,
  value,
  error,
  onChange,
  editable = true,
  userAddress,
}: LocationPickerFieldProps) {
  const [show, setShow] = useState(false);

  const isUsingMyAddress = !!userAddress && value === userAddress;

  const handleToggleMyAddress = () => {
    if (isUsingMyAddress) {
      onChange("");
    } else if (userAddress) {
      onChange(userAddress);
    }
  };

  return (
    <View style={styles.inputGroup}>
      <View style={ls.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {userAddress && editable && (
          <TouchableOpacity
            style={ls.myAddressBtn}
            onPress={handleToggleMyAddress}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={isUsingMyAddress ? "check-box" : "check-box-outline-blank"}
              size={16}
              color={isUsingMyAddress ? colors.primary.DEFAULT : colors.text.placeholder}
            />
            <Text style={[ls.myAddressText, isUsingMyAddress && ls.myAddressTextActive]}>
              Use my address
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.inputWrapper, error && styles.inputWrapperError]}
        onPress={() => editable && setShow(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="location-on" size={20} style={styles.inputIcon} />
        <Text
          style={[styles.input, !value && { color: colors.text.placeholder }]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <MaterialIcons name="chevron-right" size={20} color={colors.text.placeholder} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <LocationPickerModal
        visible={show}
        title={`Set ${label}`}
        onConfirm={(address) => {
          setShow(false);
          onChange(address);
        }}
        onCancel={() => setShow(false)}
      />
    </View>
  );
}

const ls = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  myAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  myAddressText: {
    fontSize: fontSize.md,
    color: colors.text.placeholder,
    fontWeight: "500",
  },
  myAddressTextActive: {
    color: colors.primary.DEFAULT,
  },
});
