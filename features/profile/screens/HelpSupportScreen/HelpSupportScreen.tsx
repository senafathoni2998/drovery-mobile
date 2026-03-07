import { borderRadius, colors, fontSize, spacing } from "@/styles/common";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Data ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    question: "How do I track my delivery?",
    answer:
      "Go to the Delivery tab and tap on your active order. You'll see real-time tracking on the map with the driver's location.",
  },
  {
    question: "How is the delivery price calculated?",
    answer:
      "Pricing is based on package size, weight, type, and a base service fee. You can use the Price Estimate tool on the home screen before placing an order.",
  },
  {
    question: "Can I cancel an order?",
    answer:
      "You can cancel an order before a driver is assigned. Once a driver accepts the order, cancellation may incur a small fee.",
  },
  {
    question: "What package sizes are available?",
    answer:
      "We support Small (up to 0.5 kg), Medium (up to 1.5 kg), Large (up to 3 kg), and XL (up to 5 kg) packages.",
  },
  {
    question: "How do I change my default address?",
    answer:
      'Go to Profile → Edit Profile and update the Default Address field. This address will be pre-filled in your future deliveries.',
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. All card data is encrypted and we never store your full card number. Only the last 4 digits are retained for display.",
  },
];

const CONTACT_CHANNELS = [
  {
    icon: "mail",
    iconType: "Ion" as const,
    label: "Email Us",
    value: "support@drovery.com",
    action: () => Linking.openURL("mailto:support@drovery.com"),
    color: "#6366F1",
  },
  {
    icon: "logo-whatsapp",
    iconType: "Ion" as const,
    label: "WhatsApp",
    value: "+62 812 0000 9999",
    action: () => Linking.openURL("https://wa.me/628120000999"),
    color: "#25D366",
  },
  {
    icon: "chatbubbles",
    iconType: "Ion" as const,
    label: "Live Chat",
    value: "Available 08:00 – 22:00",
    action: () => {},
    color: "#EC4899",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function HelpSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <LinearGradient
        colors={["#8B5CF6", "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>Help & Support</Text>
          <Text style={s.headerSubtitle}>How can we help you?</Text>
        </View>
        <View style={s.headerDecor} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Contact channels ── */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Text style={s.sectionLabel}>Contact Us</Text>
          <View style={s.channelsCard}>
            {CONTACT_CHANNELS.map((ch, i) => (
              <View key={ch.label}>
                <TouchableOpacity style={s.channelRow} onPress={ch.action} activeOpacity={0.7}>
                  <View style={[s.channelIcon, { backgroundColor: `${ch.color}18` }]}>
                    <Ionicons name={ch.icon as any} size={20} color={ch.color} />
                  </View>
                  <View style={s.channelInfo}>
                    <Text style={s.channelLabel}>{ch.label}</Text>
                    <Text style={s.channelValue}>{ch.value}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={colors.border.focus} />
                </TouchableOpacity>
                {i < CONTACT_CHANNELS.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── FAQ ── */}
        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <Text style={s.sectionLabel}>Frequently Asked Questions</Text>

          {/* Search */}
          <View style={s.searchRow}>
            <MaterialIcons name="search" size={18} color={colors.text.placeholder} />
            <TextInput
              style={s.searchInput}
              placeholder="Search questions..."
              placeholderTextColor={colors.text.placeholder}
              value={search}
              onChangeText={setSearch}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <MaterialIcons name="close" size={16} color={colors.text.placeholder} />
              </TouchableOpacity>
            )}
          </View>

          <View style={s.faqCard}>
            {filtered.length === 0 ? (
              <Text style={s.noResults}>No results found for "{search}"</Text>
            ) : (
              filtered.map((faq, i) => (
                <View key={i}>
                  <TouchableOpacity
                    style={s.faqRow}
                    onPress={() => setExpanded(expanded === i ? null : i)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.faqQuestion}>{faq.question}</Text>
                    <MaterialIcons
                      name={expanded === i ? "expand-less" : "expand-more"}
                      size={22}
                      color={colors.text.light}
                    />
                  </TouchableOpacity>
                  {expanded === i && (
                    <Text style={s.faqAnswer}>{faq.answer}</Text>
                  )}
                  {i < filtered.length - 1 && <View style={s.divider} />}
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    overflow: "hidden",
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.xxl,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  headerDecor: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text.light,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Channels
  channelsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: 14,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  channelInfo: {
    flex: 1,
  },
  channelLabel: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.text.primary,
  },
  channelValue: {
    fontSize: fontSize.sm,
    color: colors.text.light,
    marginTop: 2,
  },
  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.primary,
  },
  // FAQ
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    gap: spacing.sm,
  },
  faqQuestion: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.text.primary,
  },
  faqAnswer: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  noResults: {
    fontSize: fontSize.sm,
    color: colors.text.placeholder,
    textAlign: "center",
    padding: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 62,
  },
});
