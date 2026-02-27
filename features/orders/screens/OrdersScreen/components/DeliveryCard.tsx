import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { spacing, borderRadius, colors, commonStyles } from "@/styles/common";
import type { DeliveryItem } from "../OrdersScreen.types";
import { StatusChip } from "./StatusChip";

interface DeliveryCardProps {
  item: DeliveryItem;
}

export function DeliveryCard({ item }: DeliveryCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push("/delivery-detail");
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardHeader}>
        <View style={commonStyles.iconContainerLg}>
          <MaterialIcons name="inventory-2" size={24} color={colors.primary.DEFAULT} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                id: {item.id}
              </Text>
              {item.subtitle && (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.cardRight}>
          <StatusChip status={item.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: colors.text.light,
  },
  cardRight: {
    alignItems: "center" as const,
    gap: spacing.sm,
  },
});
