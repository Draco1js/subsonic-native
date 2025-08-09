import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";
import { useSubsonic } from "@/contexts/subsonic";

export default function LibraryScreen() {
  const { client } = useSubsonic();
  const { data, isLoading, error } = useQuery({
    enabled: !!client,
    queryKey: ["artists"],
    // biome-ignore lint/style/noNonNullAssertion: Query is guarded by `enabled`
    queryFn: () => client!.getArtists(),
  });

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="py-8">
          <Text className="mb-2 font-bold text-3xl text-foreground">
            Library
          </Text>
          {!client ? (
            <Text className="text-muted-foreground">
              Connect to your Subsonic server in Settings.
            </Text>
          ) : isLoading ? (
            <Text className="text-muted-foreground">Loading…</Text>
          ) : error ? (
            <Text className="text-destructive">Failed to load artists</Text>
          ) : (
            <View className="mt-4">
              {/* biome-ignore lint/suspicious/noExplicitAny: Response shape is server-defined */}
              {(data as any)?.artists?.index?.map((idx: any) => (
                <View key={idx.name}>
                  <Text className="mt-4 mb-2 text-muted-foreground">
                    {idx.name}
                  </Text>
                  <View className="rounded-md border border-border">
                    {(idx.artist ?? []).map((a: any) => (
                      <Link
                        key={a.id}
                        href={`/(drawer)/(tabs)/artist/${a.id}`}
                        asChild
                      >
                        <Pressable className="px-3 py-3">
                          <Text className="text-foreground">{a.name}</Text>
                        </Pressable>
                      </Link>
                    ))}
                  </View>
                </View>
              ))}
              <View className="mt-8">
                <Link href="/(drawer)/(tabs)/playlists" asChild>
                  <Pressable className="rounded-md border border-border px-3 py-3">
                    <Text className="text-foreground">View Playlists</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}
