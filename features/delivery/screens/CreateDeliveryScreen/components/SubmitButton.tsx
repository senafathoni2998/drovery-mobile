import React from "react";
import { ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../CreateDeliveryScreen.styles";

interface SubmitButtonProps {
  onPress: () => void;
  loading?: boolean;
  label?: string;
}

export function SubmitButton({
  onPress,
  loading = false,
  label = "Create Delivery",
}: SubmitButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={styles.submitButton}>
      <LinearGradient
        colors={["#14B8A6", "#06B6D4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.submitGradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text style={styles.submitText}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}
