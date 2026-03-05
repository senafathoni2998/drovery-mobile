import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { borderRadius, colors, fontSize, spacing } from "@/styles/common";

const NOMINATIM = "https://nominatim.openstreetmap.org";
const HEADERS = {
  "Accept-Language": "en",
  "User-Agent": "Drovery/1.0",
};

const DEFAULT_REGION: Region = {
  latitude: 3.139,
  longitude: 101.6869,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface SearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
}

interface Props {
  visible: boolean;
  title: string;
  onConfirm: (address: string) => void;
  onCancel: () => void;
}

export function LocationPickerModal({ visible, title, onConfirm, onCancel }: Props) {
  const mapRef = useRef<MapView>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [reversing, setReversing] = useState(false);

  // Center map on user's current location when modal opens
  useEffect(() => {
    if (!visible) return;
    setMarker(null);
    setAddress("");
    setSearchText("");
    setResults([]);
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const region: Region = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      mapRef.current?.animateToRegion(region, 600);
    })();
  }, [visible]);

  const reverseGeocode = async (lat: number, lng: number) => {
    setReversing(true);
    try {
      const res = await fetch(
        `${NOMINATIM}/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: HEADERS },
      );
      const data = await res.json();
      const found: string = data.display_name ?? "";
      setAddress(found);
      setSearchText(found);
    } catch {
      setAddress("");
    } finally {
      setReversing(false);
    }
  };

  const searchAddress = async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `${NOMINATIM}/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        { headers: HEADERS },
      );
      const data: SearchResult[] = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchAddress(text), 500);
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ lat: latitude, lng: longitude });
    setResults([]);
    Keyboard.dismiss();
    reverseGeocode(latitude, longitude);
    mapRef.current?.animateToRegion(
      { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      400,
    );
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMarker({ lat, lng });
    setAddress(result.display_name);
    setSearchText(result.display_name);
    setResults([]);
    Keyboard.dismiss();
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      400,
    );
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.closeBtn} onPress={onCancel}>
            <Ionicons name="close" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={s.title}>{title}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Search + dropdown container */}
        <View style={s.searchContainer}>
          <View style={s.searchBar}>
            <MaterialIcons name="search" size={20} color={colors.primary.DEFAULT} />
            <TextInput
              style={s.searchInput}
              placeholder="Search an address..."
              placeholderTextColor={colors.text.placeholder}
              value={searchText}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              onSubmitEditing={() => searchAddress(searchText)}
            />
            {searching && <ActivityIndicator size="small" color={colors.primary.DEFAULT} />}
            {searchText.length > 0 && !searching && (
              <TouchableOpacity onPress={() => { setSearchText(""); setResults([]); }}>
                <MaterialIcons name="close" size={18} color={colors.text.placeholder} />
              </TouchableOpacity>
            )}
          </View>

          {/* Dropdown results */}
          {results.length > 0 && (
            <View style={s.dropdown}>
              <FlatList
                data={results}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.resultItem}
                    onPress={() => handleSelectResult(item)}
                  >
                    <MaterialIcons name="location-on" size={16} color={colors.primary.DEFAULT} />
                    <Text style={s.resultText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={s.divider} />}
              />
            </View>
          )}
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          style={s.map}
          initialRegion={DEFAULT_REGION}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton
        >
          {marker && (
            <Marker
              coordinate={{ latitude: marker.lat, longitude: marker.lng }}
              pinColor={colors.primary.DEFAULT}
            />
          )}
        </MapView>

        {/* Bottom bar */}
        <View style={s.bottomBar}>
          <View style={s.addressRow}>
            {reversing ? (
              <ActivityIndicator color={colors.primary.DEFAULT} />
            ) : (
              <>
                <View style={s.addressIcon}>
                  <MaterialIcons name="location-on" size={18} color={colors.primary.DEFAULT} />
                </View>
                <Text style={s.addressText} numberOfLines={2}>
                  {address || "Tap on the map to select a location"}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            onPress={() => address && onConfirm(address)}
            disabled={!address}
            style={s.pickBtn}
          >
            <LinearGradient
              colors={address ? ["#14B8A6", "#06B6D4"] : [colors.border.DEFAULT, colors.border.DEFAULT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.pickBtnGradient}
            >
              <MaterialIcons name="my-location" size={18} color="#fff" />
              <Text style={s.pickBtnText}>Pick Location</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.light,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: fontSize["2xl"],
    fontWeight: "600",
    color: colors.text.primary,
  },
  searchContainer: {
    zIndex: 20,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  dropdown: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    marginTop: spacing.xs,
    maxHeight: 220,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    gap: spacing.sm,
  },
  resultText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  map: {
    flex: 1,
    marginTop: spacing.md,
  },
  bottomBar: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 36,
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
    lineHeight: 20,
  },
  pickBtn: {
    height: 52,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  pickBtnGradient: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  pickBtnText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.white,
  },
});
