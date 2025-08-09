import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Container } from "@/components/container";
import { useSubsonic } from "@/contexts/subsonic";

export default function SettingsScreen() {
  const { credentials, setCredentials, lastError } = useSubsonic();
  const [baseUrl, setBaseUrl] = React.useState(credentials?.baseUrl ?? "");
  const [username, setUsername] = React.useState(credentials?.username ?? "");
  const [password, setPassword] = React.useState(credentials?.password ?? "");
  const [useTokenAuth, setUseTokenAuth] = React.useState(
    credentials?.useTokenAuth ?? true,
  );

  const onSave = async () => {
    const next =
      baseUrl && username && password
        ? { baseUrl, username, password, useTokenAuth }
        : null;
    await setCredentials(next as any);
  };

  React.useEffect(() => {
    setBaseUrl(credentials?.baseUrl ?? "");
    setUsername(credentials?.username ?? "");
    setPassword(credentials?.password ?? "");
    setUseTokenAuth(credentials?.useTokenAuth ?? true);
  }, [credentials]);

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="py-8">
          <Text className="mb-2 font-bold text-3xl text-foreground">
            Settings
          </Text>
          <Text className="mb-6 text-lg text-muted-foreground">
            Configure your Subsonic server
          </Text>
          {!!lastError && (
            <View className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2">
              <Text className="text-destructive">{lastError}</Text>
            </View>
          )}
          <View className="gap-4">
            <View>
              <Text className="mb-2 text-foreground">Base URL</Text>
              <TextInput
                placeholder="https://demo.subsonic.org"
                autoCapitalize="none"
                value={baseUrl}
                onChangeText={setBaseUrl}
                className="rounded-md border border-border px-3 py-2 text-foreground"
              />
            </View>
            <View>
              <Text className="mb-2 text-foreground">Username</Text>
              <TextInput
                placeholder="Username"
                autoCapitalize="none"
                value={username}
                onChangeText={setUsername}
                className="rounded-md border border-border px-3 py-2 text-foreground"
              />
            </View>
            <View>
              <Text className="mb-2 text-foreground">Password</Text>
              <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="rounded-md border border-border px-3 py-2 text-foreground"
              />
            </View>
            <TouchableOpacity
              onPress={() => setUseTokenAuth((v) => !v)}
              className="flex-row items-center justify-between rounded-md border border-border px-3 py-3"
            >
              <Text className="text-foreground">Use token auth</Text>
              <Text className="text-muted-foreground">
                {useTokenAuth ? "On" : "Off"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => void onSave()}
              className="items-center rounded-md bg-primary px-4 py-3"
            >
              <Text className="font-medium text-primary-foreground">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
