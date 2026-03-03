import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../CreateDeliveryScreen.styles";

interface SwapButtonProps {
  onPress?: () => void;
}

export function SwapButton({ onPress }: SwapButtonProps) {
  return (
    <View style={styles.swapButtonContainer}>
      <TouchableOpacity style={styles.swapButton} onPress={onPress}>
        <Ionicons name="swap-vertical" size={20} color="#0D9488" />
      </TouchableOpacity>
    </View>
  );
}
