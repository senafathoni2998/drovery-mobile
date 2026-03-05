import React from "react";
import { View } from "react-native";
import { DateTimePickerField } from "./DateTimePickerField";
import { styles } from "../CreateDeliveryScreen.styles";

interface DateTimeRowProps {
  dateProps: {
    label: string;
    placeholder: string;
    value: string;
    error?: string;
    onChangeText: (v: string) => void;
    editable?: boolean;
  };
  timeProps: {
    label: string;
    placeholder: string;
    value: string;
    error?: string;
    onChangeText: (v: string) => void;
    editable?: boolean;
  };
}

export function DateTimeRow({ dateProps, timeProps }: DateTimeRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.halfWidth}>
        <DateTimePickerField
          mode="date"
          icon="calendar-month"
          label={dateProps.label}
          placeholder={dateProps.placeholder}
          value={dateProps.value}
          error={dateProps.error}
          onChange={dateProps.onChangeText}
          editable={dateProps.editable}
        />
      </View>
      <View style={styles.halfWidth}>
        <DateTimePickerField
          mode="time"
          icon="schedule"
          label={timeProps.label}
          placeholder={timeProps.placeholder}
          value={timeProps.value}
          error={timeProps.error}
          onChange={timeProps.onChangeText}
          editable={timeProps.editable}
        />
      </View>
    </View>
  );
}
