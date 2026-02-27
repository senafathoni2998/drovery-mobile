import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, borderRadius, commonStyles } from "../../../../../styles/common";

interface OrdersHeaderProps {
  query: string;
  sortBy: string;
  sortVisible: boolean;
  onQueryChange: (value: string) => void;
  onToggleSort: () => void;
  onSelectSort: (option: string) => void;
}

const SORT_OPTIONS = [
  { key: "recent", label: "Sort by Recent" },
  { key: "title", label: "Sort by Title (A-Z)" },
  { key: "status", label: "Sort by Status" },
];

export function OrdersHeader({
  query,
  sortBy,
  sortVisible,
  onQueryChange,
  onToggleSort,
  onSelectSort,
}: OrdersHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Delivery</Text>

      <View style={styles.headerRight}>
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search by title or id"
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Sort Button */}
        <TouchableOpacity style={styles.sortButton} onPress={onToggleSort}>
          <Ionicons name="options" size={20} color={sortBy ? "#fff" : "#94A3B8"} />
        </TouchableOpacity>

        {/* Sort Dropdown */}
        {sortVisible && (
          <View style={styles.sortDropdown}>
            <View style={styles.sortDropdownArrow} />
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  sortBy === option.key && styles.sortOptionActive,
                ]}
                onPress={() => onSelectSort(option.key)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option.key && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sortBy === option.key && (
                  <Ionicons name="checkmark" size={16} color={colors.primary.DEFAULT} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  headerRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
  },
  searchBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
  },
  sortButton: {
    padding: spacing.sm,
  },
  sortDropdown: {
    position: "absolute",
    right: 0,
    top: 48,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 180,
    zIndex: 100,
  },
  sortDropdownArrow: {
    position: "absolute",
    right: spacing.md,
    top: -6,
    width: 12,
    height: 12,
    backgroundColor: colors.white,
    transform: [{ rotate: "45deg" }],
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.border.DEFAULT,
  },
  sortOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sortOptionActive: {
    backgroundColor: "#F0FDFA",
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  sortOptionTextActive: {
    color: colors.primary.DEFAULT,
    fontWeight: "500",
  },
});
