import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Container } from "@/components/container";
import { CoverArt } from "@/components/cover-art";
import { TrackList } from "@/components/track-list";
import { usePlayer } from "@/contexts/player";
import { useSubsonic } from "@/contexts/subsonic";
import { buildTracksFromSongs } from "@/lib/formatters";

export default function PlaylistScreen() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { client } = useSubsonic();
  const { playTracks } = usePlayer();
  const { data, isLoading, error } = useQuery({
    enabled: !!client && !!playlistId,
    queryKey: ["playlist", playlistId],
    queryFn: () => client!.getPlaylist({ id: String(playlistId) }),
  });
  return (
    <Container>
      <View className="flex-1 p-6">
        <View className="py-8">
          <Text className="mb-2 font-bold text-3xl text-foreground">
            Playlist
          </Text>
          {!client ? (
            <Text className="text-muted-foreground">
              Connect your server in Settings.
            </Text>
          ) : isLoading ? (
            <Text className="text-muted-foreground">Loading…</Text>
          ) : error ? (
            <Text className="text-destructive">Failed to load playlist</Text>
          ) : (
            <>
              <View className="mb-4 flex-row items-center gap-4">
                <CoverArt
                  coverArtId={(data as any)?.playlist?.coverArt}
                  size={512}
                  className="h-24 w-24 rounded-md bg-muted"
                />
                <View className="flex-1">
                  <Text
                    numberOfLines={2}
                    className="font-semibold text-foreground text-xl"
                  >
                    {(data as any)?.playlist?.name}
                  </Text>
                  <Text className="text-muted-foreground">
                    ID: {playlistId}
                  </Text>
                </View>
              </View>
              <View className="mb-4 flex-row justify-end">
                <TouchableOpacity
                  onPress={async () => {
                    const songs = (data as any)?.playlist?.entry ?? [];
                    const tracks = await buildTracksFromSongs(client!, songs);
                    await playTracks(tracks, 0);
                  }}
                  className="rounded-md bg-primary px-4 py-2"
                >
                  <Text className="text-primary-foreground">Play</Text>
                </TouchableOpacity>
              </View>
              <TrackList songs={(data as any)?.playlist?.entry ?? []} />
            </>
          )}
        </View>
      </View>
    </Container>
  );
}
