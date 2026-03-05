import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/styles/common";
import { styles } from "../CreateDeliveryScreen.styles";
import { LocationPickerModal } from "./LocationPickerModal";

interface LocationPickerFieldProps {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  editable?: boolean;
}

export function LocationPickerField({
  label,
  placeholder,
  value,
  error,
  onChange,
  editable = true,
}: LocationPickerFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
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
