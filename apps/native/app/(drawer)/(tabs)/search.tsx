import { useQuery } from "@tanstack/react-query";
import { Link } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Container } from "@/components/container";
import { usePlayer } from "@/contexts/player";
import { useSubsonic } from "@/contexts/subsonic";
import { buildTracksFromSongs } from "@/lib/formatters";

export default function SearchScreen() {
  const { client } = useSubsonic();
  const { playTracks } = usePlayer();
  const [query, setQuery] = React.useState("");
  const debounced = useDebounced(query, 350);
  const { data, isFetching } = useQuery({
    enabled: !!client && !!debounced,
    queryKey: ["search", debounced],
    queryFn: () => client!.search({ query: debounced }),
  });

  const songs = (data as any)?.searchResult3?.song ?? [];
  const albums = (data as any)?.searchResult3?.album ?? [];
  const artists = (data as any)?.searchResult3?.artist ?? [];

  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="py-8">
          <Text className="mb-4 font-bold text-3xl text-foreground">
            Search
          </Text>
          <TextInput
            placeholder="Search songs, albums, artists"
            autoCapitalize="none"
            value={query}
            onChangeText={setQuery}
            className="mb-4 rounded-md border border-border px-3 py-2 text-foreground"
          />
          {!client ? (
            <Text className="text-muted-foreground">
              Connect your server in Settings.
            </Text>
          ) : isFetching ? (
            <Text className="text-muted-foreground">Searching…</Text>
          ) : (
            <View className="gap-6">
              {!!artists.length && (
                <View>
                  <Text className="mb-2 text-foreground">Artists</Text>
                  <View className="rounded-md border border-border">
                    {artists.map((a: any) => (
                      <Link key={a.id} href={`/(drawer)/(tabs)/artist/${a.id}`}>
                        <Text className="px-3 py-3 text-foreground">
                          {a.name}
                        </Text>
                      </Link>
                    ))}
                  </View>
                </View>
              )}
              {!!albums.length && (
                <View>
                  <Text className="mb-2 text-foreground">Albums</Text>
                  <View className="rounded-md border border-border">
                    {albums.map((al: any) => (
                      <Link
                        key={al.id}
                        href={`/(drawer)/(tabs)/album/${al.id}`}
                      >
                        <Text className="px-3 py-3 text-foreground">
                          {al.name}
                        </Text>
                      </Link>
                    ))}
                  </View>
                </View>
              )}
              {!!songs.length && (
                <View>
                  <Text className="mb-2 text-foreground">Songs</Text>
                  <View className="rounded-md border border-border">
                    {songs.map((s: any, idx: number) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={async () => {
                          const tracks = await buildTracksFromSongs(client!, [
                            s,
                          ]);
                          await playTracks(tracks, 0);
                        }}
                      >
                        <Text className="px-3 py-3 text-foreground">
                          {s.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

function useDebounced(value: string, delayMs: number) {
  const [state, setState] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setState(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return state;
}
