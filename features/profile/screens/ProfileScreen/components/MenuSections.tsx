import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { spacing, borderRadius, colors, commonStyles } from "@/styles/common";

export interface MenuItem {
  icon: keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap;
  iconType: "Material" | "Ion";
  title: string;
  subtitle?: string;
  color: string;
  onPress?: () => void;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuSectionsProps {
  sections: MenuSection[];
}

export function MenuSections({ sections }: MenuSectionsProps) {
  const MenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
        {item.iconType === "Material" ? (
          <MaterialIcons name={item.icon as any} size={22} color={item.color} />
        ) : (
          <Ionicons name={item.icon as any} size={22} color={item.color} />
        )}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        {item.subtitle && <Text style={styles.menuSubtitle}>{item.subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.border.focus} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex}>
                <MenuItem item={item} />
                {itemIndex < section.items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.light,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    padding: 14,
    backgroundColor: "transparent",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.primary,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.text.light,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 62,
  },
});
