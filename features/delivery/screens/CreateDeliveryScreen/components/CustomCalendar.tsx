import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { MaterialIcons } from "@expo/vector-icons";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface Props {
  visible: boolean;
  initialDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export function CustomCalendar({ visible, initialDate, onConfirm, onCancel }: Props) {
  const [viewDate, setViewDate] = useState(() => {
    const d = initialDate ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState<Date>(initialDate ?? new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: Array<{ day: number; thisMonth: boolean }> = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, thisMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, thisMonth: true });
  }
  while (cells.length < 42) {
    cells.push({ day: cells.length - daysInMonth - firstDayOfWeek + 1, thisMonth: false });
  }

  const weeks = Array.from({ length: 6 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  const isSelected = (cell: (typeof cells)[0]) =>
    cell.thisMonth &&
    cell.day === selected.getDate() &&
    month === selected.getMonth() &&
    year === selected.getFullYear();

  const isToday = (cell: (typeof cells)[0]) =>
    cell.thisMonth &&
    cell.day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={s.overlay}>
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={s.sheet}>
          {/* Header */}
          <View style={s.headerBar}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={s.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={s.title}>Select Date</Text>
            <TouchableOpacity onPress={() => onConfirm(selected)}>
              <Text style={s.done}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Month navigation */}
          <View style={s.monthNav}>
            <TouchableOpacity
              style={s.navBtn}
              onPress={() => setViewDate(new Date(year, month - 1, 1))}
            >
              <MaterialIcons name="chevron-left" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={s.monthLabel}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <TouchableOpacity
              style={s.navBtn}
              onPress={() => setViewDate(new Date(year, month + 1, 1))}
            >
              <MaterialIcons name="chevron-right" size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Day name labels */}
          <View style={s.dayLabels}>
            {DAY_LABELS.map((d) => (
              <Text key={d} style={s.dayLabel}>
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={s.grid}>
            {weeks.map((week, wi) => (
              <View key={wi} style={s.week}>
                {week.map((cell, ci) => {
                  const sel = isSelected(cell);
                  const tod = isToday(cell);
                  return (
                    <TouchableOpacity
                      key={ci}
                      style={[s.cell, sel && s.cellSel, !sel && tod && s.cellToday]}
                      onPress={() => {
                        if (!cell.thisMonth) return;
                        setSelected(new Date(year, month, cell.day));
                      }}
                      activeOpacity={cell.thisMonth ? 0.7 : 1}
                    >
                      <Text
                        style={[
                          s.cellText,
                          !cell.thisMonth && s.cellTextOther,
                          sel && s.cellTextSel,
                          !sel && tod && s.cellTextToday,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: 32,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.text.primary,
  },
  cancel: {
    fontSize: fontSize.base,
    color: colors.text.muted,
  },
  done: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.light,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: fontSize["2xl"],
    fontWeight: "700",
    color: colors.text.primary,
  },
  dayLabels: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text.light,
  },
  grid: {
    gap: spacing.xs,
  },
  week: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
  },
  cellSel: {
    backgroundColor: colors.primary.DEFAULT,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
  },
  cellText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  cellTextOther: {
    color: colors.text.placeholder,
  },
  cellTextSel: {
    color: colors.white,
    fontWeight: "700",
  },
  cellTextToday: {
    color: colors.primary.DEFAULT,
    fontWeight: "700",
  },
});
