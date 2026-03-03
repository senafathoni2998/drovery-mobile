import React from "react";
import { View } from "react-native";
import { InputField, InputFieldProps } from "./InputField";
import { styles } from "../CreateDeliveryScreen.styles";

interface DateTimeRowProps {
  dateProps: Omit<InputFieldProps, "keyboardType">;
  timeProps: Omit<InputFieldProps, "keyboardType">;
}

export function DateTimeRow({ dateProps, timeProps }: DateTimeRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.halfWidth}>
        <InputField {...dateProps} />
      </View>
      <View style={styles.halfWidth}>
        <InputField {...timeProps} />
      </View>
    </View>
  );
}
