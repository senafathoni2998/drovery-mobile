import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../CreateDeliveryScreen.styles";

interface PackageSizeSelectorProps {
  sizes: readonly string[];
  selected: string;
  onSelect: (size: string) => void;
  error?: string;
}

export function PackageSizeSelector({
  sizes,
  selected,
  onSelect,
  error,
}: PackageSizeSelectorProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Package Size</Text>
      <View style={styles.sizeSelector}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeOption,
              selected === size && styles.sizeOptionActive,
            ]}
            onPress={() => onSelect(size)}
          >
            <Text
              style={[
                styles.sizeOptionText,
                selected === size && styles.sizeOptionTextActive,
              ]}
            >
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
