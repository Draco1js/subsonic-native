import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MiniPlayer } from "@/components/mini-player";
import { PlayerSheet } from "@/components/player-sheet";
import { PlayerProvider } from "@/contexts/player";
import { PlayerUIProvider } from "@/contexts/player-ui";
import { SubsonicProvider } from "@/contexts/subsonic";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { NAV_THEME } from "@/lib/constants";
import { getQueryClient } from "@/lib/query";
import { useColorScheme } from "@/lib/use-color-scheme";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export const unstable_settings = {
  initialRouteName: "(drawer)",
};

export default function RootLayout() {
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  // Render immediately; set nav bar in an effect
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setAndroidNavigationBar(colorScheme);
  }, [colorScheme]);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <SubsonicProvider>
        <PlayerProvider>
          <PlayerUIProvider>
            <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
              <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
              <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack>
                  <Stack.Screen
                    name="(drawer)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="modal" options={{ title: "Player" }} />
                </Stack>
                {/* Overlays are mounted in the Tabs layout so they can read the real tab bar height */}
              </GestureHandlerRootView>
            </ThemeProvider>
          </PlayerUIProvider>
        </PlayerProvider>
      </SubsonicProvider>
    </QueryClientProvider>
  );
}

const useIsomorphicLayoutEffect = React.useLayoutEffect;
