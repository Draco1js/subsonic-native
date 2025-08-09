import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Container } from "@/components/container";
import { CoverArt } from "@/components/cover-art";
import { TrackList } from "@/components/track-list";
import { usePlayer } from "@/contexts/player";
import { useSubsonic } from "@/contexts/subsonic";
import { buildTracksFromSongs } from "@/lib/formatters";

export default function AlbumScreen() {
  const { albumId } = useLocalSearchParams<{ albumId: string }>();
  const { client } = useSubsonic();
  const { playTracks } = usePlayer();
  const { data, isLoading, error } = useQuery({
    enabled: !!client && !!albumId,
    queryKey: ["album", albumId],
    queryFn: () => client!.getAlbum({ id: String(albumId) }),
  });
  return (
    <Container>
      <View className="flex-1 p-6">
        <View className="py-8">
          <Text className="mb-2 font-bold text-3xl text-foreground">Album</Text>
          {!client ? (
            <Text className="text-muted-foreground">
              Connect your server in Settings.
            </Text>
          ) : isLoading ? (
            <Text className="text-muted-foreground">Loading…</Text>
          ) : error ? (
            <Text className="text-destructive">Failed to load album</Text>
          ) : (
            <>
              <View className="mb-4 flex-row items-center gap-4">
                <CoverArt
                  coverArtId={(data as any)?.album?.coverArt}
                  size={512}
                  className="h-24 w-24 rounded-md bg-muted"
                />
                <View className="flex-1">
                  <Text
                    numberOfLines={2}
                    className="font-semibold text-foreground text-xl"
                  >
                    {(data as any)?.album?.name}
                  </Text>
                  <Text className="text-muted-foreground">ID: {albumId}</Text>
                </View>
              </View>
              <View className="mb-4 flex-row justify-end">
                <TouchableOpacity
                  onPress={async () => {
                    const songs = (data as any)?.album?.song ?? [];
                    const tracks = await buildTracksFromSongs(client!, songs);
                    await playTracks(tracks, 0);
                  }}
                  className="rounded-md bg-primary px-4 py-2"
                >
                  <Text className="text-primary-foreground">Play</Text>
                </TouchableOpacity>
              </View>
              <TrackList songs={(data as any)?.album?.song ?? []} />
            </>
          )}
        </View>
      </View>
    </Container>
  );
}
