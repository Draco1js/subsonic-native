import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { usePlayer } from "@/contexts/player";
import { useSubsonic } from "@/contexts/subsonic";
import { buildTracksFromSongs } from "@/lib/formatters";
import type { Track } from "@/types/music";

type Props =
  | { tracks: Track[]; songs?: never }
  | { tracks?: never; songs: any[] };

export function TrackList(props: Props) {
  const { playTracks } = usePlayer();
  const { client } = useSubsonic();
  const [built, setBuilt] = React.useState<Track[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if ("songs" in props) {
        if (!client) return setBuilt([]);
        const t = await buildTracksFromSongs(client, props.songs);
        if (!cancelled) setBuilt(t);
      } else if ("tracks" in props) {
        setBuilt(props.tracks);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [client, "songs" in props ? props.songs : props.tracks]);

  const data = built ?? [];

  return (
    <FlatList
      data={data}
      keyExtractor={(t) => t.id}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() => void playTracks(data, index)}
          className="flex-row items-center justify-between px-2 py-3"
        >
          <View className="flex-1 pr-3">
            <Text numberOfLines={1} className="text-foreground">
              {item.title}
            </Text>
            {!!item.artistName && (
              <Text numberOfLines={1} className="text-muted-foreground text-sm">
                {item.artistName}
              </Text>
            )}
          </View>
          <Text className="text-muted-foreground">▶︎</Text>
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View className="h-px bg-border" />}
    />
  );
}
