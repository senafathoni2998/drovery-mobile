import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerBackVisible: false,
        headerShown: false,
      }}
    />
  );
}
