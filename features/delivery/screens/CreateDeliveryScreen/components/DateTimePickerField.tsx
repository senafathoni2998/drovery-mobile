import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/styles/common";
import { styles } from "../CreateDeliveryScreen.styles";
import { CustomCalendar } from "./CustomCalendar";
import { CustomTimePicker } from "./CustomTimePicker";

interface DateTimePickerFieldProps {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  placeholder: string;
  value: string;
  error?: string;
  mode: "date" | "time";
  onChange: (value: string) => void;
  editable?: boolean;
}

export function DateTimePickerField({
  label,
  icon,
  placeholder,
  value,
  error,
  mode,
  onChange,
  editable = true,
}: DateTimePickerFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.inputWrapper, error && styles.inputWrapperError]}
        onPress={() => editable && setShow(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons name={icon} size={20} style={styles.inputIcon} />
        <Text style={[styles.input, !value && { color: colors.text.placeholder }]}>
          {value || placeholder}
        </Text>
        <MaterialIcons
          name={mode === "date" ? "calendar-today" : "access-time"}
          size={18}
          color={colors.text.placeholder}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {mode === "date" ? (
        <CustomCalendar
          visible={show}
          onConfirm={(date) => {
            setShow(false);
            onChange(
              date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
            );
          }}
          onCancel={() => setShow(false)}
        />
      ) : (
        <CustomTimePicker
          visible={show}
          value={value}
          onConfirm={(time) => {
            setShow(false);
            onChange(time);
          }}
          onCancel={() => setShow(false)}
        />
      )}
    </View>
  );
}
