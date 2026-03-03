import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../CreateDeliveryScreen.styles";

interface FormHeaderProps {
  title: string;
  onBack: () => void;
}

export function FormHeader({ title, onBack }: FormHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.headerBlur} />
      </LinearGradient>
    </View>
  );
}
