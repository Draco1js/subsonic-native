import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import React, { createContext, useCallback, useContext, useState } from "react";
import type { Track } from "@/types/music";

type PlayerContextValue = {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  playTracks: (tracks: Track[], startIndex?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seekTo: (ms: number) => Promise<void>;
  jumpToIndex: (index: number) => Promise<void>;
  removeAtIndex: (index: number) => void;
  moveIndex: (from: number, to: number) => void;
  clearQueue: () => void;
  shuffle: boolean;
  repeat: "off" | "one" | "all";
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer();
  const status = useAudioPlayerStatus(player);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const currentTrack = currentIndex >= 0 ? (queue[currentIndex] ?? null) : null;

  const isPlaying = !!status?.playing;
  const positionMs = Math.max(0, Math.floor((status?.currentTime ?? 0) * 1000));
  const durationMs = Math.max(0, Math.floor((status?.duration ?? 0) * 1000));

  const replaceAndPlay = useCallback(
    async (track: Track) => {
      if (!track.streamUrl) return;
      player.replace({ uri: track.streamUrl });
      player.play();
    },
    [player],
  );

  const playTracks = useCallback(
    async (tracks: Track[], startIndex = 0) => {
      setQueue(tracks);
      setCurrentIndex(startIndex);
      const track = tracks[startIndex];
      if (track) await replaceAndPlay(track);
    },
    [replaceAndPlay],
  );

  const togglePlayPause = useCallback(async () => {
    if (status?.playing) player.pause();
    else player.play();
  }, [player, status?.playing]);

  const next = useCallback(async () => {
    if (repeat === "one" && currentIndex >= 0) {
      await replaceAndPlay(queue[currentIndex]);
      return;
    }
    const hasNext = currentIndex + 1 < queue.length;
    if (hasNext) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      const track = queue[newIndex];
      if (track) await replaceAndPlay(track);
    } else if (repeat === "all" && queue.length > 0) {
      setCurrentIndex(0);
      const track = queue[0];
      if (track) await replaceAndPlay(track);
    } else {
      player.pause();
    }
  }, [currentIndex, queue, replaceAndPlay, player, repeat]);

  // Auto-advance when track finishes: subscribe to status
  React.useEffect(() => {
    if (!status) return;
    if (status.didJustFinish) {
      void next();
    }
  }, [status?.didJustFinish]);

  const previous = useCallback(async () => {
    if (positionMs > 3000) {
      await player.seekTo(0);
      return;
    }
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      const track = queue[newIndex];
      if (track) await replaceAndPlay(track);
    }
  }, [currentIndex, positionMs, queue, replaceAndPlay, player]);

  const seekTo = useCallback(
    async (ms: number) => {
      await player.seekTo(ms / 1000);
    },
    [player],
  );

  const jumpToIndex = useCallback(
    async (index: number) => {
      if (index < 0 || index >= queue.length) return;
      setCurrentIndex(index);
      const track = queue[index];
      if (track) await replaceAndPlay(track);
    },
    [queue, replaceAndPlay],
  );

  const removeAtIndex = useCallback((index: number) => {
    setQueue((q) => q.filter((_, i) => i !== index));
    setCurrentIndex((i) => (index < i ? i - 1 : index === i ? -1 : i));
  }, []);

  const moveIndex = useCallback((from: number, to: number) => {
    setQueue((q) => {
      const next = q.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setCurrentIndex((i) => {
      if (i === from) return to;
      if (from < i && i <= to) return i - 1;
      if (to <= i && i < from) return i + 1;
      return i;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(-1);
    player.pause();
  }, [player]);

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(
    () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    [],
  );

  const value: PlayerContextValue = {
    currentTrack,
    queue,
    currentIndex,
    isPlaying,
    positionMs,
    durationMs,
    playTracks,
    togglePlayPause,
    next,
    previous,
    seekTo,
    jumpToIndex,
    removeAtIndex,
    moveIndex,
    clearQueue,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
  };

  // Web-only media session removed; native lock screen controls will be added via media controls lib in dev build

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function useOptionalPlayer() {
  return useContext(PlayerContext) ?? null;
}
