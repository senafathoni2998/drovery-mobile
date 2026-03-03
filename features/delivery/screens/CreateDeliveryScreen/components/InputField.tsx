import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "../CreateDeliveryScreen.styles";

export interface InputFieldProps {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  placeholder: string;
  value: string;
  error?: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  keyboardType?: "default" | "email-address" | "decimal-pad";
}

export function InputField({
  label,
  icon,
  placeholder,
  value,
  error,
  onChangeText,
  editable = true,
  keyboardType = "default",
}: InputFieldProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <MaterialIcons name={icon} size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType={keyboardType}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
