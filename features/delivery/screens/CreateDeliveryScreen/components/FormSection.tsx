import React from "react";
import { View, ViewStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "react-native";
import { styles } from "../CreateDeliveryScreen.styles";

interface FormSectionProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function FormSection({ title, icon, children, style }: FormSectionProps) {
  return (
    <View style={[styles.section, style]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <MaterialIcons name={icon} size={20} color="#0D9488" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
