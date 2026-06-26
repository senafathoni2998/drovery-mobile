import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { spacing, colors, commonStyles } from "../../../../styles/common";
import { ProfileHeader } from "./components/ProfileHeader";
import { StatsSection } from "./components/StatsSection";
import { MenuSections, type MenuSection } from "./components/MenuSections";
import { LogoutButton } from "./components/LogoutButton";

// ==================== COMPONENT ====================
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout: authLogout } = useAuth();
  const userName = user?.name ?? "User";
  const userEmail = user?.email ?? "";

  const MENU_SECTIONS: MenuSection[] = [
    {
      title: "Account Settings",
      items: [
        { icon: "person", iconType: "Material", title: "Edit Profile", color: colors.primary.DEFAULT, onPress: () => router.push("/edit-profile") },
        { icon: "payments", iconType: "Material", title: "Payment Methods", color: colors.success, onPress: () => router.push("/payment-methods") },
        { icon: "place", iconType: "Material", title: "Saved Addresses", color: "#3B82F6", onPress: () => router.push("/addresses") },
        { icon: "notifications", iconType: "Material", title: "Notification Settings", color: "#6366F1", onPress: () => router.push("/notification-settings") },
      ],
    },
    {
      title: "Wallet & Rewards",
      items: [
        { icon: "account-balance-wallet", iconType: "Material", title: "Wallet & Credits", color: "#0EA5E9", onPress: () => router.push("/wallet") },
        { icon: "card-giftcard", iconType: "Material", title: "Refer & Earn", color: "#F59E0B", onPress: () => router.push("/referrals") },
      ],
    },
    {
      title: "Deliveries",
      items: [
        { icon: "favorite", iconType: "Material", title: "Favorites", color: "#EC4899", onPress: () => router.push("/favorites") },
        { icon: "repeat", iconType: "Material", title: "Recurring Deliveries", color: "#8B5CF6", onPress: () => router.push("/recurring-deliveries") },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: "support-agent", iconType: "Material", title: "My Tickets", color: "#0EA5E9", onPress: () => router.push("/support-tickets") },
        { icon: "help-circle", iconType: "Ion", title: "Help & Support", color: "#8B5CF6", onPress: () => router.push("/help-support") },
        { icon: "description", iconType: "Material", title: "Terms & Privacy", color: colors.text.muted, onPress: () => router.push("/terms-privacy") },
      ],
    },
  ];

  // Handle hardware back button - exit app on profile screen
  React.useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      BackHandler.exitApp();
      return true;
    });
    return () => subscription.remove();
  }, []);

  const handleLogout = async () => {
    await authLogout();
    router.replace("/login");
  };

  const handleEditProfile = () => {
    router.push("/edit-profile");
  };

  return (
    <View style={[commonStyles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500).springify()}>
          <ProfileHeader
            userName={userName}
            userEmail={userEmail}
            onEdit={handleEditProfile}
          />
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <StatsSection />
        </Animated.View>

        {/* Menu Sections */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <MenuSections sections={MENU_SECTIONS} />
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <LogoutButton onPress={handleLogout} />
        </Animated.View>

        {/* App Version */}
        <Text style={styles.versionText}>Drovery v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  versionText: {
    fontSize: 12,
    color: colors.text.placeholder,
    textAlign: "center",
    marginTop: 24,
    marginBottom: spacing.lg,
  },
});
