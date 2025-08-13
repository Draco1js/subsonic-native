import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { TabBarIcon } from "@/components/tabbar-icon";
import { MiniPlayer } from "@/components/mini-player";
import { PlayerSheet } from "@/components/player-sheet";
import { useColorScheme } from "@/lib/use-color-scheme";

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDarkColorScheme
          ? "hsl(217.2 91.2% 59.8%)"
          : "hsl(221.2 83.2% 53.3%)",
        tabBarInactiveTintColor: isDarkColorScheme
          ? "hsl(215 20.2% 65.1%)"
          : "hsl(215.4 16.3% 46.9%)",
        tabBarStyle: {
          backgroundColor: isDarkColorScheme
            ? "hsl(222.2 84% 4.9%)"
            : "hsl(0 0% 100%)",
          borderTopColor: isDarkColorScheme
            ? "hsl(217.2 32.6% 17.5%)"
            : "hsl(214.3 31.8% 91.4%)",
        },
      }}
      >
      {/* Primary tabs only: Home, Search, Library */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <TabBarIcon name="music" color={color} />,
        }}
      />

      {/* Hide detail routes from the tab bar */}
      <Tabs.Screen name="artist/[artistId]" options={{ href: null }} />
      <Tabs.Screen name="album/[albumId]" options={{ href: null }} />
      <Tabs.Screen name="playlist/[playlistId]" options={{ href: null }} />
      <Tabs.Screen name="song/[songId]" options={{ href: null }} />
      <Tabs.Screen name="playlists" options={{ href: null }} />
      </Tabs>
      <MiniPlayer insetBottom={insets.bottom + tabBarHeight} />
      <PlayerSheet insetBottom={insets.bottom + tabBarHeight} />
    </View>
  );
}
