import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { styles } from "../CreateDeliveryScreen.styles";

const SIZE_INFO: Record<string, { dims: string; weight: string }> = {
  Small:  { dims: "20×15×10 cm", weight: "≤ 0.5 kg" },
  Medium: { dims: "30×20×15 cm", weight: "≤ 1.5 kg" },
  Large:  { dims: "40×30×20 cm", weight: "≤ 3 kg"   },
  XL:     { dims: "50×40×25 cm", weight: "≤ 5 kg"   },
};

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
        {sizes.map((size) => {
          const isSelected = selected === size;
          const info = SIZE_INFO[size];
          return (
            <TouchableOpacity
              key={size}
              style={[styles.sizeOption, isSelected && styles.sizeOptionActive]}
              onPress={() => onSelect(size)}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={styles.sizeCheckBadge}>
                  <MaterialIcons name="check" size={10} color="#fff" />
                </View>
              )}
              <Text style={[styles.sizeOptionText, isSelected && styles.sizeOptionTextActive]}>
                {size}
              </Text>
              {info && (
                <>
                  <Text style={[styles.sizeDims, isSelected && styles.sizeDimsActive]}>
                    {info.dims}
                  </Text>
                  <Text style={[styles.sizeWeight, isSelected && styles.sizeWeightActive]}>
                    {info.weight}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
