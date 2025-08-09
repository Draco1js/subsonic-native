import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Drawer } from "expo-router/drawer";

import { HeaderButton } from "@/components/header-button";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

const DrawerLayout = () => {
  return (
    <Drawer>
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "Browse",
          drawerLabel: "Browse",
          drawerIcon: ({ size, color }) => (
            <MaterialIcons name="border-bottom" size={size} color={color} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <HeaderButton />
            </Link>
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          headerTitle: "Settings",
          drawerLabel: "Settings",
          drawerIcon: ({ size, color }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="downloads"
        options={{
          headerTitle: "Downloads",
          drawerLabel: "Downloads",
          drawerIcon: ({ size, color }) => (
            <Ionicons name="download-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
