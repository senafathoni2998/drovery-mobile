import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { PushRegistrar } from "@/features/notifications/PushRegistrar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PushRegistrar />
      <Stack
        screenOptions={{
          headerTransparent: true,
          headerBackVisible: false,
          headerShown: false,
        }}
      />
    </AuthProvider>
  );
}
