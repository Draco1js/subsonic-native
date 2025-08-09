import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useOptionalPlayer } from "@/contexts/player";
import { usePlayerUI } from "@/contexts/player-ui";

export function MiniPlayer({ insetBottom = 0 }: { insetBottom?: number }) {
  const player = useOptionalPlayer();
  const title = player?.currentTrack?.title ?? "Not playing";
  const subtitle = player?.currentTrack?.artistName ?? "";
  const isPlaying = player?.isPlaying ?? false;
  const progress =
    (player?.durationMs ?? 0) > 0
      ? Math.min(1, (player?.positionMs ?? 0) / (player?.durationMs ?? 1))
      : 0;

  const { open } = usePlayerUI();
  const translateX = useSharedValue(0);
  const fling = Gesture.Pan()
    .onChange((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      try {
        if (translateX.value > 80) {
          player?.previous();
        } else if (translateX.value < -80) {
          player?.next();
        }
      } catch {}
      translateX.value = withTiming(0, { duration: 120 });
    });

  const stylez = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={fling}>
      <Animated.View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 16 + insetBottom + 56,
          borderRadius: 10,
          overflow: "hidden",
        }}
        className="border border-border bg-card/95"
      >
        <View className="h-[2px] w-full bg-border">
          <View
            style={{ width: `${progress * 100}%` }}
            className="h-[2px] bg-primary"
          />
        </View>
        <View className="flex-row items-center justify-between px-3 py-3">
          <TouchableOpacity
            onPress={open}
            className="flex-1 flex-row items-center"
          >
            {player?.currentTrack?.coverArtUrl ? (
              <Image
                source={{ uri: player.currentTrack.coverArtUrl }}
                className="mr-3 h-10 w-10 rounded-md"
              />
            ) : (
              <View className="mr-3 h-10 w-10 rounded-md bg-muted" />
            )}
            <TouchableOpacity className="flex-1 pr-3" onPress={open}>
              <Animated.View style={stylez}>
                <Text
                  numberOfLines={1}
                  className="font-semibold text-foreground"
                >
                  {title}
                </Text>
                {!!subtitle && (
                  <Text numberOfLines={1} className="text-muted-foreground">
                    {subtitle}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          </TouchableOpacity>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              disabled={!player}
              onPress={() => void player?.togglePlayPause()}
              className="h-8 w-8 items-center justify-center rounded-full border border-border"
            >
              <Text className="text-foreground">{isPlaying ? "❚❚" : "▶"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
