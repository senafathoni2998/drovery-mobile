import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, {
  AnimatedRegion,
  Marker,
  MarkerAnimated,
  Polyline,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { borderRadius, colors, spacing } from "../../../../styles/common";
import { statusMeta } from "@/services/deliveryStatus";
import { useDeliveryTracking } from "../../hooks/useDeliveryTracking";

// ==================== MAIN COMPONENT ====================
export function TrackOnMapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { data: apiDelivery, loading } = useDeliveryTracking(params.id);
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [, setMapReady] = useState(false);

  // Use real coordinates from API if available, fallback to defaults
  const PICKUP_COORD = {
    latitude: apiDelivery?.fromLat ?? -6.903,
    longitude: apiDelivery?.fromLng ?? 107.615,
  };
  const DROPOFF_COORD = {
    latitude: apiDelivery?.toLat ?? -6.922,
    longitude: apiDelivery?.toLng ?? 107.607,
  };

  const tracking = apiDelivery?.tracking;
  const DRONE_COORD = tracking?.droneLat && tracking?.droneLng
    ? { latitude: tracking.droneLat, longitude: tracking.droneLng }
    : { latitude: (PICKUP_COORD.latitude + DROPOFF_COORD.latitude) / 2, longitude: (PICKUP_COORD.longitude + DROPOFF_COORD.longitude) / 2 };

  const ROUTE_COORDS = [PICKUP_COORD, DRONE_COORD, DROPOFF_COORD];

  // Animated drone position — glides smoothly to each polled location so the
  // drone visibly "flies" between updates instead of teleporting.
  const droneRegion = useRef(
    new AnimatedRegion({
      latitude: DRONE_COORD.latitude,
      longitude: DRONE_COORD.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;

  useEffect(() => {
    if (tracking?.droneLat != null && tracking?.droneLng != null) {
      droneRegion
        .timing({
          // react-native-maps' AnimatedRegion.timing accepts lat/lng directly;
          // the typings incorrectly require `toValue`, so cast the config.
          latitude: tracking.droneLat,
          longitude: tracking.droneLng,
          latitudeDelta: 0,
          longitudeDelta: 0,
          duration: 3500,
          useNativeDriver: false,
        } as any)
        .start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracking?.droneLat, tracking?.droneLng]);

  const meta = statusMeta(apiDelivery?.status);
  // "Live" = not settled. RETURNING is non-terminal (drone still flying the
  // package home → keep the map live); DELIVERY_FAILED / RETURNED_TO_BASE are
  // terminal → no LIVE badge, no pulsing drone, no ETA.
  const isLive = !!apiDelivery && !meta.terminal;

  const DELIVERY_INFO = {
    id: apiDelivery?.trackingId ?? "",
    status: apiDelivery ? meta.label : "Loading",
    statusColor: meta.color,
    from: apiDelivery?.fromAddress ?? "",
    to: apiDelivery?.toAddress ?? "",
    eta: !apiDelivery || meta.terminal ? "—" : (tracking?.eta ?? apiDelivery.pickupTime ?? ""),
    droneStatus: tracking?.droneStatus ?? (apiDelivery ? meta.label : ""),
  };

  const initialRegion = {
    latitude: (PICKUP_COORD.latitude + DROPOFF_COORD.latitude) / 2,
    longitude: (PICKUP_COORD.longitude + DROPOFF_COORD.longitude) / 2,
    latitudeDelta: 0.035,
    longitudeDelta: 0.035,
  };

  // Pulse animation for the drone marker — only while the delivery is live. A
  // settled (failed/returned/delivered/canceled) flight shouldn't keep pulsing.
  useEffect(() => {
    if (!isLive) {
      pulseAnim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim, isLive]);

  const handleFitRoute = () => {
    mapRef.current?.fitToCoordinates([PICKUP_COORD, DROPOFF_COORD], {
      edgePadding: { top: 120, right: 40, bottom: 280, left: 40 },
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        onMapReady={() => {
          setMapReady(true);
          setTimeout(handleFitRoute, 300);
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Route polyline */}
        <Polyline
          coordinates={ROUTE_COORDS}
          strokeColor="#14B8A6"
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />

        {/* Pickup marker */}
        <Marker
          coordinate={PICKUP_COORD}
          title="Pickup"
          description={DELIVERY_INFO.from}
        >
          <MaterialIcons name="location-on" size={40} color="#10B981" />
        </Marker>

        {/* Drop-off marker */}
        <Marker
          coordinate={DROPOFF_COORD}
          title="Drop-off"
          description={DELIVERY_INFO.to}
        >
          <MaterialIcons name="location-on" size={40} color="#F43F5E" />
        </Marker>

        {/* Drone marker — animates between live positions */}
        <MarkerAnimated coordinate={droneRegion} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.droneMarkerWrapper}>
            <Animated.View
              style={[styles.dronePulse, { transform: [{ scale: pulseAnim }] }]}
            />
            <View style={styles.droneMarker}>
              <MaterialIcons name="flight" size={18} color="#fff" />
            </View>
          </View>
        </MarkerAnimated>
      </MapView>

      {/* Top header overlay */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent"]}
        style={[styles.headerOverlay, { paddingTop: insets.top + spacing.sm }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track on Map</Text>
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={handleFitRoute}
        >
          <MaterialIcons name="center-focus-strong" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Bottom info panel */}
      <View
        style={[
          styles.bottomPanel,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        {/* Drag handle */}
        <View style={styles.dragHandle} />

        {/* Delivery ID + Status */}
        <View style={styles.panelHeader}>
          <View style={styles.idRow}>
            <MaterialIcons
              name="route"
              size={14}
              color={colors.primary.DEFAULT}
            />
            <Text style={styles.idText}>#{DELIVERY_INFO.id}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[styles.statusDot, { backgroundColor: DELIVERY_INFO.statusColor }]}
            />
            <Text style={[styles.statusText, { color: DELIVERY_INFO.statusColor }]}>
              {isLive ? `${DELIVERY_INFO.status} · LIVE` : DELIVERY_INFO.status}
            </Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeCard}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotPickup]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routePointLabel}>From</Text>
              <Text style={styles.routePointValue} numberOfLines={1}>
                {DELIVERY_INFO.from}
              </Text>
            </View>
          </View>
          <View style={styles.routeConnector}>
            <View style={styles.routeConnectorLine} />
          </View>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotDropoff]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routePointLabel}>To</Text>
              <Text style={styles.routePointValue} numberOfLines={1}>
                {DELIVERY_INFO.to}
              </Text>
            </View>
          </View>
        </View>

        {/* Drone status + ETA */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <LinearGradient
              colors={["#14B8A6", "#06B6D4"]}
              style={styles.metaIconBg}
            >
              <MaterialIcons name="flight" size={16} color="#fff" />
            </LinearGradient>
            <View style={styles.metaTextWrapper}>
              <Text style={styles.metaLabel}>Drone Status</Text>
              <Text style={styles.metaValue}>{DELIVERY_INFO.droneStatus}</Text>
            </View>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaItem}>
            <View style={[styles.metaIconBg, styles.metaIconBgEta]}>
              <MaterialIcons name="schedule" size={16} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.metaLabel}>Estimated Arrival</Text>
              <Text style={[styles.metaValue, { color: colors.warning }]}>
                {DELIVERY_INFO.eta}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
  },
  recenterButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  droneMarkerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
  },
  dronePulse: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(20, 184, 166, 0.25)",
  },
  droneMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#14B8A6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#14B8A6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },

  // Bottom panel
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
    gap: spacing.lg,
  },
  dragHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
    marginBottom: spacing.xs,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  idRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  idText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
  },

  // Route card
  routeCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  routeConnector: {
    paddingLeft: 3,
    paddingVertical: 3,
  },
  routeConnectorLine: {
    width: 2,
    height: 12,
    backgroundColor: "#CBD5E1",
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  routeDotPickup: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  routeDotDropoff: {
    backgroundColor: "#F43F5E",
    borderColor: "#F43F5E",
  },
  routeInfo: {
    flex: 1,
  },
  routePointLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.text.placeholder,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  routePointValue: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.primary,
  },

  // Meta row
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minWidth: 0,
    overflow: "hidden",
  },
  metaDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#E2E8F0",
    marginHorizontal: spacing.md,
    flexShrink: 0,
  },
  metaIconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  metaIconBgEta: {
    backgroundColor: "#FEF3C7",
  },
  metaTextWrapper: {
    flex: 1,
    flexShrink: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text.placeholder,
    marginBottom: 1,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.primary,
    flexShrink: 1,
  },
});
