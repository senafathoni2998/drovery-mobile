import React, { useEffect, useRef, useState } from "react";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";

const ITEM_H = 52;
const VISIBLE = 5;
const PAD = 2; // items above/below the center

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")); // "01".."12"
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0")); // "00","05".."55"
const PICKER_H = ITEM_H * VISIBLE;

function parse(value?: string): { h: number; m: number; am: boolean } {
  if (!value) return { h: 9, m: 0, am: true };
  const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return { h: 9, m: 0, am: true };
  const raw = parseInt(match[1]);
  const minVal = parseInt(match[2]);
  const am = match[3].toUpperCase() === "AM";
  return {
    h: raw === 12 ? 0 : raw - 1,        // 0-based into HOURS
    m: Math.round(minVal / 5) % 12,     // 0-based into MINUTES
    am,
  };
}

interface Props {
  visible: boolean;
  value?: string;
  onConfirm: (time: string) => void;
  onCancel: () => void;
}

export function CustomTimePicker({ visible, value, onConfirm, onCancel }: Props) {
  const init = parse(value);
  const [hIdx, setHIdx] = useState(init.h);
  const [mIdx, setMIdx] = useState(init.m);
  const [isAm, setIsAm] = useState(init.am);
  const hRef = useRef<ScrollView>(null);
  const mRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => {
        hRef.current?.scrollTo({ y: hIdx * ITEM_H, animated: false });
        mRef.current?.scrollTo({ y: mIdx * ITEM_H, animated: false });
      }, 80);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const snap = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
    count: number,
    setter: (i: number) => void,
  ) => {
    const idx = Math.min(
      Math.max(Math.round(e.nativeEvent.contentOffset.y / ITEM_H), 0),
      count - 1,
    );
    setter(idx);
  };

  const handleConfirm = () => {
    onConfirm(`${HOURS[hIdx]}:${MINUTES[mIdx]} ${isAm ? "AM" : "PM"}`);
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={ts.overlay}>
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={ts.sheet}>
          {/* Header */}
          <View style={ts.headerBar}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={ts.cancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={ts.title}>Select Time</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={ts.done}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Pickers row */}
          <View style={ts.pickerRow}>
            {/* Selection highlight band (rendered first = behind scrollers) */}
            <View style={ts.band} pointerEvents="none" />

            <Roller
              ref={hRef}
              items={HOURS}
              onSnap={(e) => snap(e, HOURS.length, setHIdx)}
            />

            <Text style={ts.colon}>:</Text>

            <Roller
              ref={mRef}
              items={MINUTES}
              onSnap={(e) => snap(e, MINUTES.length, setMIdx)}
            />

            {/* AM / PM toggle */}
            <View style={ts.ampm}>
              {(["AM", "PM"] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[ts.ampmBtn, isAm === (p === "AM") && ts.ampmActive]}
                  onPress={() => setIsAm(p === "AM")}
                >
                  <Text style={[ts.ampmTxt, isAm === (p === "AM") && ts.ampmTxtActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const Roller = React.forwardRef<
  ScrollView,
  {
    items: string[];
    onSnap: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  }
>(function Roller({ items, onSnap }, ref) {
  const padded = [...Array(PAD).fill(null), ...items, ...Array(PAD).fill(null)];
  return (
    <ScrollView
      ref={ref}
      style={ts.roller}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      onMomentumScrollEnd={onSnap}
      onScrollEndDrag={onSnap}
    >
      {padded.map((item, i) => (
        <View key={i} style={ts.rollerCell}>
          <Text style={[ts.rollerTxt, !item && ts.ghost]}>{item ?? "00"}</Text>
        </View>
      ))}
    </ScrollView>
  );
});

const ts = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: 32,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.text.primary,
  },
  cancel: { fontSize: fontSize.base, color: colors.text.muted },
  done: { fontSize: fontSize.base, fontWeight: "600", color: colors.primary.DEFAULT },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    position: "relative",
  },
  band: {
    position: "absolute",
    left: spacing.xl,
    right: spacing.xl,
    top: ITEM_H * PAD,
    height: ITEM_H,
    backgroundColor: "#F0FDFA",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#CCFBF1",
    zIndex: -1,
  },
  colon: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text.primary,
    paddingHorizontal: spacing.xs,
    alignSelf: "center",
  },
  ampm: {
    marginLeft: spacing.md,
    gap: spacing.sm,
  },
  ampmBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    alignItems: "center",
  },
  ampmActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  ampmTxt: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  ampmTxtActive: { color: colors.white },
  roller: {
    height: PICKER_H,
    flex: 1,
  },
  rollerCell: {
    height: ITEM_H,
    alignItems: "center",
    justifyContent: "center",
  },
  rollerTxt: {
    fontSize: fontSize["3xl"],
    fontWeight: "600",
    color: colors.text.primary,
  },
  ghost: { opacity: 0 },
});
