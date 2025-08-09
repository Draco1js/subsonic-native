import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { usePlayer } from "@/contexts/player";
import { usePlayerUI } from "@/contexts/player-ui";
import { fetchLyrics } from "@/lib/lyrics";

const SHEET_OFFSET = 64;

export function PlayerSheet() {
  const { isOpen, close } = usePlayerUI();
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    next,
    previous,
    positionMs,
    durationMs,
    seekTo,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();
  const [lyrics, setLyrics] = React.useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = React.useState(false);

  const screen = Dimensions.get("window");
  const y = useSharedValue(screen.height);

  React.useEffect(() => {
    y.value = withTiming(isOpen ? 0 : screen.height, { duration: 260 });
  }, [isOpen]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (
        !currentTrack?.title ||
        !currentTrack.artistName ||
        !currentTrack.albumName ||
        !currentTrack.durationMs
      ) {
        setLyrics(null);
        return;
      }
      setLoadingLyrics(true);
      const rec = await fetchLyrics({
        trackName: currentTrack.title,
        artistName: currentTrack.artistName,
        albumName: currentTrack.albumName,
        durationSec: Math.round((currentTrack.durationMs ?? 0) / 1000),
        cachedOnly: false,
      });
      if (!cancelled) {
        setLyrics(rec?.plainLyrics ?? rec?.syncedLyrics ?? null);
        setLoadingLyrics(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id]);

  const pan = Gesture.Pan()
    .onChange((e) => {
      y.value = Math.max(0, y.value + e.changeY);
    })
    .onEnd(() => {
      if (y.value > screen.height / 4) {
        y.value = withTiming(screen.height, { duration: 220 }, (finished) => {
          if (finished) {
            runOnJS(close)();
          }
        });
      } else {
        y.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const stylez = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));
  const pct = durationMs ? Math.min(1, positionMs / durationMs) : 0;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        pointerEvents={isOpen ? "auto" : "none"}
        style={[
          { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
          stylez,
        ]}
        className="bg-background"
      >
        <View className="mt-3 h-1 w-12 self-center rounded-full bg-border" />
        <View className="flex-1 items-center justify-center p-6">
          {!!currentTrack?.albumName && (
            <Text className="mb-4 text-center font-bold text-2xl text-foreground">
              {currentTrack.albumName}
            </Text>
          )}
          <View className="mb-8 w-full items-center">
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
          <View className="mb-4 w-full">
            <View className="h-2 w-full rounded-full bg-border">
              <View
                style={{ width: `${pct * 100}%` }}
                className="h-2 rounded-full bg-primary"
              />
            </View>
          </View>
          {!!lyrics && (
            <View className="mt-4 max-h-48 w-full rounded-md border border-border bg-card p-3">
              <Text className="text-foreground text-sm" numberOfLines={8}>
                {lyrics}
              </Text>
            </View>
          )}
          <View className="mt-6 flex-row items-center justify-center gap-10">
            <TouchableOpacity onPress={() => void previous()}>
              <Ionicons name="play-skip-back" size={28} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void togglePlayPause()}>
              <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={32}
                  color="#000000"
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void next()}>
              <Ionicons name="play-skip-forward" size={28} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View className="mt-6 flex-row items-center justify-center gap-10">
            <TouchableOpacity onPress={() => void toggleShuffle()}>
              <Ionicons
                name="shuffle"
                size={22}
                color={shuffle ? "#22c55e" : "#888"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void cycleRepeat()}>
              <Ionicons
                name="repeat"
                size={22}
                color={repeat !== "off" ? "#22c55e" : "#888"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
