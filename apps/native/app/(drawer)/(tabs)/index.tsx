import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "expo-router";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Container } from "@/components/container";
import { CoverArt } from "@/components/cover-art";
import { MiniPlayer } from "@/components/mini-player";
import { useSubsonic } from "@/contexts/subsonic";

export default function TabOne() {
  const queryClient = useQueryClient();
  const { client } = useSubsonic();
  const newest = useQuery({
    enabled: !!client,
    queryKey: ["home", "newest"],
    // biome-ignore lint/style/noNonNullAssertion: Query is guarded by `enabled`
    queryFn: () => client!.getAlbumList2({ type: "newest", size: 12 }),
  });
  const random = useQuery({
    enabled: !!client,
    queryKey: ["home", "random"],
    // biome-ignore lint/style/noNonNullAssertion: Query is guarded by `enabled`
    queryFn: () => client!.getAlbumList2({ type: "random", size: 12 }),
  });
  const playlists = useQuery({
    enabled: !!client,
    queryKey: ["home", "playlists"],
    // biome-ignore lint/style/noNonNullAssertion: Query is guarded by `enabled`
    queryFn: () => client!.getPlaylists(),
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["home", "newest"] }),
        queryClient.invalidateQueries({ queryKey: ["home", "random"] }),
        queryClient.invalidateQueries({ queryKey: ["home", "playlists"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return (
    <Container>
      <ScrollView
        className="flex-1 p-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-8">
          <Text className="mb-2 font-bold text-3xl text-foreground">Home</Text>
          {!client ? (
            <Text className="text-muted-foreground">
              Connect your server in Settings.
            </Text>
          ) : (
            <View className="gap-8">
              <HomeRow
                title="Newest Albums"
                items={((newest.data as any)?.albumList2?.album ?? []).slice(
                  0,
                  12,
                )}
              />
              <HomeRow
                title="Random Albums"
                items={((random.data as any)?.albumList2?.album ?? []).slice(
                  0,
                  12,
                )}
              />
              <HomePlaylists
                title="Playlists"
                items={(
                  (playlists.data as any)?.playlists?.playlist ?? []
                ).slice(0, 12)}
              />
            </View>
          )}
        </View>
      </ScrollView>
      {/* MiniPlayer is rendered globally in RootLayout; don't duplicate here */}
    </Container>
  );
}

function HomeRow({ title, items }: { title: string; items: any[] }) {
  return (
    <View>
      <Text className="mb-3 font-semibold text-foreground text-xl">
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-2"
      >
        <View className="flex-row">
          {items.map((al: any) => (
            <Link key={al.id} href={`/(drawer)/(tabs)/album/${al.id}`} asChild>
              <Pressable className="mx-2 w-36">
                <CoverArt
                  coverArtId={al.coverArt}
                  size={256}
                  className="aspect-square w-full rounded-md bg-muted"
                />
                <Text numberOfLines={2} className="mt-2 text-foreground">
                  {al.name}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function HomePlaylists({ title, items }: { title: string; items: any[] }) {
  return (
    <View>
      <Text className="mb-3 font-semibold text-foreground text-xl">
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-2"
      >
        <View className="flex-row">
          {items.map((pl: any) => (
            <Link
              key={pl.id}
              href={`/(drawer)/(tabs)/playlist/${pl.id}`}
              asChild
            >
              <Pressable className="mx-2 w-36">
                <CoverArt
                  coverArtId={pl.coverArt}
                  size={256}
                  className="aspect-square w-full rounded-md bg-muted"
                />
                <Text numberOfLines={2} className="mt-2 text-foreground">
                  {pl.name}
                </Text>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
