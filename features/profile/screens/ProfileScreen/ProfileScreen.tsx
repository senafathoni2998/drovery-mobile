import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackHandler } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../../../auth/services/authService";
import { spacing, colors, commonStyles } from "../../../../styles/common";
import { ProfileHeader } from "./components/ProfileHeader";
import { StatsSection } from "./components/StatsSection";
import { MenuSections, type MenuSection } from "./components/MenuSections";
import { LogoutButton } from "./components/LogoutButton";

// ==================== COMPONENT ====================
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const userName = "Sena";
  const userEmail = "sena@drovery.com";

  const MENU_SECTIONS: MenuSection[] = [
    {
      title: "Account Settings",
      items: [
        { icon: "person", iconType: "Material", title: "Edit Profile", color: colors.primary.DEFAULT, onPress: () => router.push("/edit-profile") },
        { icon: "payments", iconType: "Material", title: "Payment Methods", color: colors.success, onPress: () => router.push("/payment-methods") },
      ],
    },
    {
      title: "Support",
      items: [
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

  const handleLogout = () => {
    authService.logout();
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
