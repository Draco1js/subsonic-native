import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Container } from "@/components/container";
import { usePlayer } from "@/contexts/player";

function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString();
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Modal() {
  const {
    currentTrack,
    isPlaying,
    positionMs,
    durationMs,
    togglePlayPause,
    previous,
    next,
    seekTo,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();
  const router = useRouter();
  return (
    <Container>
      <View className="flex-1 p-6">
        <View className="mb-6 items-center">
          <Text className="mb-1 text-center font-bold text-2xl text-foreground">
            {currentTrack?.albumName ?? ""}
          </Text>
        </View>
        <View className="my-8 w-full items-center">
          {currentTrack?.coverArtUrl ? (
            <Image
              source={{ uri: currentTrack.coverArtUrl }}
              className="h-80 w-80 rounded-xl"
            />
          ) : (
            <View className="h-80 w-80 rounded-xl bg-muted" />
          )}
        </View>
        <View className="mb-4 items-center">
          <Text className="mb-1 text-center font-semibold text-foreground text-xl">
            {currentTrack?.title ?? "Nothing Playing"}
          </Text>
          {!!currentTrack?.artistName && (
            <Text className="text-center text-muted-foreground">
              {currentTrack.artistName}
            </Text>
          )}
        </View>
        <View className="mb-4">
          <View className="mb-2 flex-row justify-between">
            <Text className="text-muted-foreground text-xs">
              {formatTime(positionMs)}
            </Text>
            <Text className="text-muted-foreground text-xs">
              {formatTime(durationMs)}
            </Text>
          </View>
          <SeekBar
            positionMs={positionMs}
            durationMs={durationMs}
            onSeek={seekTo}
          />
        </View>
        <View className="mt-6 flex-row items-center justify-center gap-10">
          <TouchableOpacity onPress={() => void previous()}>
            <Text className="text-3xl text-foreground">⏮</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void togglePlayPause()}>
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Text className="font-bold text-2xl text-primary-foreground">
                {isPlaying ? "❚❚" : "▶"}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void next()}>
            <Text className="text-3xl text-foreground">⏭</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-6 flex-row items-center justify-center gap-10">
          <TouchableOpacity onPress={() => void toggleShuffle()}>
            <Text className="text-primary">
              Shuffle: {shuffle ? "On" : "Off"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void cycleRepeat()}>
            <Text className="text-primary">Repeat: {repeat}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
}

function SeekBar({
  positionMs,
  durationMs,
  onSeek,
}: {
  positionMs: number;
  durationMs: number;
  onSeek: (ms: number) => Promise<void>;
}) {
  const percent = durationMs ? Math.min(1, positionMs / durationMs) : 0;
  return (
    <View>
      <View className="h-2 w-full rounded-full bg-border">
        <View
          style={{ width: `${percent * 100}%` }}
          className="h-2 rounded-full bg-primary"
        />
      </View>
      <View className="mt-2 flex-row justify-between">
        <TouchableOpacity
          onPress={() => void onSeek(Math.max(0, positionMs - 15000))}
        >
          <Text className="text-primary">-15s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => void onSeek(Math.min(durationMs, positionMs + 15000))}
        >
          <Text className="text-primary">+15s</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
