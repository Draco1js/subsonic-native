import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Image, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Gesture, GestureDetector, ScrollView as GHScrollView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { usePlayer } from "@/contexts/player";
import { usePlayerUI } from "@/contexts/player-ui";
import { fetchLyrics, parseSyncedLyrics, type SyncedLine } from "@/lib/lyrics";

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
  const [synced, setSynced] = React.useState<SyncedLine[]>([]);
  const [expandLyrics, setExpandLyrics] = React.useState(false);
  const expandSV = useSharedValue(0);
  const [loadingLyrics, setLoadingLyrics] = React.useState(false);

  const screen = Dimensions.get("window");
  const artSize = Math.min(320, Math.round(screen.width * 0.8));
  const headerToArtGap = Math.max(16, Math.round(screen.height * 0.04));
  const controlsTopGap = Math.max(24, Math.round(screen.height * 0.06));
  const y = useSharedValue(screen.height);

  React.useEffect(() => {
    y.value = withTiming(isOpen ? 0 : screen.height, { duration: 260 });
  }, [isOpen]);

  React.useEffect(() => {
    expandSV.value = withTiming(expandLyrics ? 1 : 0, { duration: 220 });
  }, [expandLyrics]);

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
        setLyrics(rec?.plainLyrics ?? null);
        setSynced(parseSyncedLyrics(rec?.syncedLyrics));
        setLoadingLyrics(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentTrack?.id]);

  const panRef = React.useRef<any>(null);
  const pan = Gesture.Pan()
    .withRef(panRef)
    // Require a slight downward pull before the sheet-dismiss pan activates so inner
    // scroll views (lyrics/content) can scroll naturally
    .activeOffsetY(16)
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
  const artAS = useAnimatedStyle(() => ({
    opacity: 1 - expandSV.value,
    transform: [{ scale: interpolate(expandSV.value, [0, 1], [1, 0.95]) }],
  }));
  const controlsAS = useAnimatedStyle(() => ({
    opacity: 1 - expandSV.value,
    transform: [{ translateY: interpolate(expandSV.value, [0, 1], [0, 24]) }],
  }));
  const lyricsBoxAS = useAnimatedStyle(() => ({
    maxHeight: interpolate(expandSV.value, [0, 1], [192, screen.height * 0.75]),
  }));
  const pct = durationMs ? Math.min(1, positionMs / durationMs) : 0;

  function LyricsView({ lines, currentMs, expanded }: { lines: SyncedLine[]; currentMs: number; expanded: boolean }) {
    const activeIndex = React.useMemo(() => {
      if (!lines.length) return -1;
      let lo = 0, hi = lines.length - 1, ans = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (lines[mid].timeMs <= currentMs) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
      }
      return ans;
    }, [lines, currentMs]);

    const scrollRef = React.useRef<ScrollView>(null);
    const containerH = React.useRef<number>(0);
    const lastY = React.useRef<number>(0);
    const lastScrollAt = React.useRef<number>(0);
    const LINE_HEIGHT = 28;

    React.useEffect(() => {
      if (activeIndex < 0) return;
      const now = Date.now();
      if (now - lastScrollAt.current < 250) return; // debounce

      const itemTop = activeIndex * LINE_HEIGHT;
      const viewTop = lastY.current;
      const viewBottom = viewTop + containerH.current;
      const safeTop = viewTop + containerH.current * 0.35;
      const safeBottom = viewTop + containerH.current * 0.65;
      if (itemTop < safeTop || itemTop > safeBottom) {
        const target = Math.max(0, itemTop - containerH.current * 0.5 + LINE_HEIGHT * 0.5);
        if (Math.abs(target - lastY.current) > LINE_HEIGHT * 0.5) {
          try {
            scrollRef.current?.scrollTo({ y: target, animated: true });
            lastScrollAt.current = now;
          } catch {}
        }
      }
    }, [activeIndex, expanded]);

    return (
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        scrollEventThrottle={16}
        onScroll={(e: any) => { lastY.current = e.nativeEvent.contentOffset.y; }}
        onLayout={(e: any) => { containerH.current = e.nativeEvent.layout.height; }}
      >
        {lines.map((item, index) => (
          <Text
            key={`${item.timeMs}-${index}`}
            style={{ height: LINE_HEIGHT, lineHeight: LINE_HEIGHT }}
            className={index === activeIndex ? "px-4 text-foreground font-semibold" : "px-4 text-muted-foreground"}
          >
            {item.text}
          </Text>
        ))}
      </ScrollView>
    );
  }

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
        <GHScrollView simultaneousHandlers={panRef} className="flex-1" contentContainerClassName="items-center p-6 pt-14 pb-28">
          <Animated.View style={artAS} className="w-full items-center">
            {!!currentTrack?.albumName && (
              <Text className="mt-1 text-center text-foreground text-base">
                {"Playing "}
                <Text className="font-semibold">{currentTrack.albumName}</Text>
              </Text>
            )}
            <View style={{ marginTop: headerToArtGap, marginBottom: headerToArtGap * 0.8 }} className="w-full items-center">
              {currentTrack?.coverArtUrl ? (
                <Image source={{ uri: currentTrack.coverArtUrl }} style={{ width: artSize, height: artSize }} className="rounded-xl" />
              ) : (
                <View style={{ width: artSize, height: artSize }} className="rounded-xl bg-muted" />
              )}
            </View>
            <View className="mb-4 items-center">
              <Text className="mb-1 text-center font-semibold text-foreground text-xl">
                {currentTrack?.title ?? "Nothing Playing"}
              </Text>
              {!!currentTrack?.artistName && (
                <Text className="text-center text-muted-foreground">{currentTrack.artistName}</Text>
              )}
            </View>
            <View className="mb-4 w-full">
              <View className="h-2 w-full rounded-full bg-border">
                <View style={{ width: `${pct * 100}%` }} className="h-2 rounded-full bg-primary" />
              </View>
            </View>
          </Animated.View>
          <Animated.View style={controlsAS}>
            <View style={{ marginTop: controlsTopGap }} className="flex-row items-center justify-center gap-10">
              <TouchableOpacity onPress={() => void previous()}>
                <Ionicons name="play-skip-back" size={28} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void togglePlayPause()}>
                <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#000000" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void next()}>
                <Ionicons name="play-skip-forward" size={28} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <View className="mt-6 flex-row items-center justify-center gap-10">
              <TouchableOpacity onPress={() => void toggleShuffle()}>
                <Ionicons name="shuffle" size={22} color={shuffle ? "#22c55e" : "#888"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => void cycleRepeat()}>
                <Ionicons name="repeat" size={22} color={repeat !== "off" ? "#22c55e" : "#888"} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {(!!synced.length || !!lyrics) && (
            <TouchableOpacity onPress={() => setExpandLyrics((v) => !v)} activeOpacity={0.9} className="w-full">
              <Animated.View style={lyricsBoxAS} className="mt-4 w-full overflow-hidden rounded-md border border-border bg-card">
                {synced.length ? (
                  <LyricsView lines={synced} currentMs={positionMs} expanded={expandLyrics} />
                ) : (
                  <GHScrollView simultaneousHandlers={panRef} className="p-3"><Text className="text-sm text-foreground">{lyrics}</Text></GHScrollView>
                 )}
               </Animated.View>
             </TouchableOpacity>
           )}
         </GHScrollView>
      </Animated.View>
    </GestureDetector>
  );
}
