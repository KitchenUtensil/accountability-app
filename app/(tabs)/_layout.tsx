import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index"></Stack.Screen>
      <Stack.Screen name="login-screen"></Stack.Screen>
      <Stack.Screen name="create-group"></Stack.Screen>
      <Stack.Screen name="join-group"></Stack.Screen>
      <Stack.Screen name="dashboard"></Stack.Screen>
      <Stack.Screen name="invite-members"></Stack.Screen>
      <Stack.Screen name="profile"></Stack.Screen>
    </Stack>
  );
}
