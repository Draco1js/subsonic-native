export type LyricsRecord = {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
};

const BASE = "https://lrclib.net";

export async function fetchLyrics(params: {
  trackName: string;
  artistName: string;
  albumName: string;
  durationSec: number;
  cachedOnly?: boolean;
}): Promise<LyricsRecord | null> {
  const sp = new URLSearchParams({
    track_name: params.trackName,
    artist_name: params.artistName,
    album_name: params.albumName,
    duration: String(Math.round(params.durationSec)),
  });
  const endpoint = params.cachedOnly ? "/api/get-cached" : "/api/get";
  const url = `${BASE}${endpoint}?${sp.toString()}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "subsonic-native/0.0.1 (https://github.com/Draco1js/subsonic-native)",
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const json = (await res.json()) as LyricsRecord;
  return json ?? null;
}
