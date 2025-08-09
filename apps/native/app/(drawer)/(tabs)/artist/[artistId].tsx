import { useQuery } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";
import { useSubsonic } from "@/contexts/subsonic";

export default function ArtistScreen() {
  const { artistId } = useLocalSearchParams<{ artistId: string }>();
  const { client } = useSubsonic();
  const { data, isLoading, error } = useQuery({
    enabled: !!client && !!artistId,
    queryKey: ["artist", artistId],
    // biome-ignore lint/style/noNonNullAssertion: Query is guarded by `enabled`
    queryFn: () => client!.getArtist({ id: String(artistId) }),
  });
  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="py-8">
          <Text className="mb-2 font-bold text-3xl text-foreground">
            Artist
          </Text>
          {!client ? (
            <Text className="text-muted-foreground">
              Connect your server in Settings.
            </Text>
          ) : isLoading ? (
            <Text className="text-muted-foreground">Loading…</Text>
          ) : error ? (
            <Text className="text-destructive">Failed to load artist</Text>
          ) : (
            <View>
              <Text className="mb-2 text-muted-foreground">ID: {artistId}</Text>
              <Text className="mt-6 mb-2 text-foreground">Albums</Text>
              <View className="rounded-md border border-border">
                {/* biome-ignore lint/suspicious/noExplicitAny: Response shape is server-defined */}
                {((data as any)?.artist?.album ?? []).map((al: any) => (
                  <Link
                    key={al.id}
                    href={`/(drawer)/(tabs)/album/${al.id}`}
                    asChild
                  >
                    <Pressable className="px-3 py-3">
                      <Text className="text-foreground">{al.name}</Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}
