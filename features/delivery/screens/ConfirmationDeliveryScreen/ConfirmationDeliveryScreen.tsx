import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ==================== HELPERS ====================

const NOMINATIM = "https://nominatim.openstreetmap.org";
const HEADERS = { "User-Agent": "Drovery/1.0", "Accept-Language": "en" };

interface Coord {
  latitude: number;
  longitude: number;
}

async function geocodeAddress(address: string): Promise<Coord | null> {
  try {
    const res = await fetch(
      `${NOMINATIM}/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: HEADERS },
    );
    const data = await res.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch {}
  return null;
}

function estimateDelivery(_dateStr: string, timeStr: string): string {
  try {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    h += 2;
    const newPeriod = h >= 12 ? "PM" : "AM";
    const dH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${String(dH).padStart(2, "0")}:${String(m).padStart(2, "0")} ${newPeriod}`;
  } catch {
    return timeStr;
  }
}

function calcPrice(size: string, weight: string): number {
  const base: Record<string, number> = {
    Small: 5,
    Medium: 8,
    Large: 12,
    XL: 18,
  };
  const kg = parseFloat(weight) || 0;
  return Math.round((base[size] ?? 5) + kg * 3);
}

const PACKAGE_LABELS: Record<string, string> = {
  food: "Food",
  document: "Document",
  fragile: "Fragile",
  electronics: "Electronics",
  clothing: "Clothing",
  healthcare: "Healthcare",
  other: "Other",
};

const PACKAGE_ACCENT: Record<string, string> = {
  food: "#F97316",
  document: "#3B82F6",
  fragile: "#8B5CF6",
  electronics: "#06B6D4",
  clothing: "#EC4899",
  healthcare: "#10B981",
  other: "#64748B",
};

// ==================== MAIN SCREEN ====================

export function ConfirmationDeliveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const mapHeight = insets.top + 260;
  const orderId = useMemo(
    () => `DRV-${Math.floor(Math.random() * 90000) + 10000}`,
    [],
  );

  const params = useLocalSearchParams<{
    from: string;
    to: string;
    receiver: string;
    packages: string;
    packageSize: string;
    packageWeight: string;
    pickupDate: string;
    pickupTime: string;
    packageTypes: string;
  }>();

  const [fromCoord, setFromCoord] = useState<Coord | null>(null);
  const [toCoord, setToCoord] = useState<Coord | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Refs so fitMap can always read the latest values regardless of closure timing
  const fromCoordRef = useRef<Coord | null>(null);
  const toCoordRef = useRef<Coord | null>(null);
  const mapReadyRef = useRef(false);

  const price = calcPrice(params.packageSize ?? "", params.packageWeight ?? "");
  const estTime = estimateDelivery(
    params.pickupDate ?? "",
    params.pickupTime ?? "",
  );
  const packageTypes: string[] = JSON.parse(params.packageTypes ?? "[]");

  const fitMap = () => {
    const from = fromCoordRef.current;
    const to = toCoordRef.current;
    if (!mapReadyRef.current || !from || !to) return;
    mapRef.current?.fitToCoordinates([from, to], {
      edgePadding: { top: insets.top + 16, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  };

  const handleMapReady = () => {
    mapReadyRef.current = true;
    fitMap();
  };

  useEffect(() => {
    (async () => {
      const [from, to] = await Promise.all([
        geocodeAddress(params.from ?? ""),
        geocodeAddress(params.to ?? ""),
      ]);
      fromCoordRef.current = from;
      toCoordRef.current = to;
      setFromCoord(from);
      setToCoord(to);
      fitMap();
    })();
  }, []);

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      router.push({
        pathname: "/delivery-congratulations",
        params: {
          orderId,
          from: params.from,
          to: params.to,
          pickupDate: params.pickupDate,
          estTime,
          price: String(price),
        },
      });
    }, 1200);
  };

  return (
    <View style={s.root}>
      {/* ── MAP — explicit height so fitToCoordinates works reliably ── */}
      <View style={[s.mapContainer, { height: mapHeight }]}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: 3.139,
            longitude: 101.6869,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          onMapReady={handleMapReady}
        >
          {fromCoord && (
            <Marker coordinate={fromCoord} title="Pickup">
              <View style={s.markerFrom}>
                <MaterialIcons name="location-on" size={24} color={colors.white} />
              </View>
            </Marker>
          )}
          {toCoord && (
            <Marker coordinate={toCoord} title="Destination">
              <View style={s.markerTo}>
                <MaterialIcons name="location-on" size={24} color={colors.white} />
              </View>
            </Marker>
          )}
          {fromCoord && toCoord && (
            <Polyline
              coordinates={[fromCoord, toCoord]}
              strokeColor={colors.primary.DEFAULT}
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>

        {/* Back button */}
        <TouchableOpacity
          style={[s.backBtn, { top: insets.top + spacing.md }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* ── CONTENT CARD ── */}
      <ScrollView
        style={s.card}
        contentContainerStyle={[s.cardContent, { paddingBottom: insets.bottom + 96 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.handle} />

        {/* Title */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(400)}
          style={s.titleRow}
        >
          <Text style={s.title}>Confirmation</Text>
          <View style={s.orderBadge}>
            <MaterialIcons
              name="tag"
              size={11}
              color={colors.primary.DEFAULT}
            />
            <Text style={s.orderBadgeText}>{orderId}</Text>
          </View>
        </Animated.View>

        {/* From / To */}
        <Animated.View
          entering={FadeInUp.delay(150).duration(400)}
          style={s.grid}
        >
          <InfoItem
            icon="flight-takeoff"
            iconColor={colors.primary.DEFAULT}
            iconBg="#F0FDFA"
            label="From"
            value={params.from ?? "—"}
          />
          <InfoItem
            icon="flight-land"
            iconColor="#F43F5E"
            iconBg="#FFF1F2"
            label="To"
            value={params.to ?? "—"}
          />
        </Animated.View>

        <View style={s.sep} />

        {/* Sender / Receiver */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(400)}
          style={s.grid}
        >
          <InfoItem
            icon="person"
            iconColor="#6366F1"
            iconBg="#EEF2FF"
            label="Sender"
            value="You"
          />
          <InfoItem
            icon="person"
            iconColor="#0EA5E9"
            iconBg="#F0F9FF"
            label="Receiver"
            value={params.receiver ?? "—"}
          />
        </Animated.View>

        <View style={s.sep} />

        {/* Pickup / Estimated */}
        <Animated.View
          entering={FadeInUp.delay(250).duration(400)}
          style={s.grid}
        >
          <InfoItem
            icon="calendar-month"
            iconColor={colors.success}
            iconBg="#F0FDF4"
            label="Pickup Date"
            value={`${params.pickupDate ?? "—"}`}
            sub={params.pickupTime}
          />
          <InfoItem
            icon="schedule"
            iconColor={colors.warning}
            iconBg="#FFFBEB"
            label="Est. Delivery"
            value={`${params.pickupDate ?? "—"}`}
            sub={estTime}
          />
        </Animated.View>

        <View style={s.sep} />

        {/* Package — full width */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(400)}
          style={s.packageRow}
        >
          <View style={[s.iconCircle, { backgroundColor: "#FFF7ED" }]}>
            <MaterialIcons
              name="inventory-2"
              size={18}
              color={colors.warning}
            />
          </View>
          <View style={s.packageInfo}>
            <Text style={s.infoLabel}>Packages</Text>
            <Text style={s.infoValue}>{params.packages ?? "—"}</Text>
            <Text style={s.infoSub}>
              {params.packageSize} · {params.packageWeight}
            </Text>
            {packageTypes.length > 0 && (
              <View style={s.typeTags}>
                {packageTypes.map((id) => (
                  <View
                    key={id}
                    style={[
                      s.typeTag,
                      {
                        backgroundColor: `${PACKAGE_ACCENT[id] ?? "#64748B"}18`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.typeTagText,
                        { color: PACKAGE_ACCENT[id] ?? "#64748B" },
                      ]}
                    >
                      {PACKAGE_LABELS[id] ?? id}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── BOTTOM BAR ── */}
      <Animated.View
        entering={FadeInUp.delay(350).duration(400)}
        style={[s.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <View style={s.priceBlock}>
          <Text style={s.priceLabel}>Est. Price</Text>
          <Text style={s.priceValue}>${price}</Text>
        </View>

        <TouchableOpacity
          style={s.confirmBtn}
          onPress={handleConfirm}
          disabled={confirming}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#14B8A6", "#06B6D4"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.confirmGradient}
          >
            {confirming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={s.confirmText}>Delivery Now</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ==================== INFO ITEM ====================

function InfoItem({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <View style={s.infoItem}>
      <View style={[s.iconCircle, { backgroundColor: iconBg }]}>
        <MaterialIcons name={icon} size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue} numberOfLines={2}>
          {value}
        </Text>
        {sub ? <Text style={s.infoSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

// ==================== STYLES ====================

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapContainer: {
    width: "100%",
    overflow: "hidden",
  },
  backBtn: {
    position: "absolute",
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  markerFrom: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  markerTo: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: "#F43F5E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  // Card
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    marginTop: -24,
  },
  cardContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.DEFAULT,
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize["4xl"],
    fontWeight: "700",
    color: colors.text.primary,
  },
  orderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  orderBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.primary.DEFAULT,
  },
  // Info grid
  grid: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sep: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.md,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    fontWeight: "500",
    color: colors.text.placeholder,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.text.primary,
    lineHeight: 20,
  },
  infoSub: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  // Package row
  packageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  packageInfo: {
    flex: 1,
  },
  typeTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  typeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  typeTagText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  priceBlock: {
    gap: 2,
  },
  priceLabel: {
    fontSize: fontSize.xs,
    color: colors.text.placeholder,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: fontSize["4xl"],
    fontWeight: "800",
    color: colors.text.primary,
  },
  confirmBtn: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  confirmGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  confirmText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.white,
  },
});
