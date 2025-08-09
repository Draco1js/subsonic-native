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

export type SyncedLine = { timeMs: number; text: string };

export function parseSyncedLyrics(lrc: string | null | undefined): SyncedLine[] {
  if (!lrc) return [];
  const lines = lrc.split(/\r?\n/);
  const result: SyncedLine[] = [];
  const timeRe = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  for (const raw of lines) {
    let match: RegExpExecArray | null;
    const times: number[] = [];
    timeRe.lastIndex = 0;
    while ((match = timeRe.exec(raw))) {
      const min = Number(match[1]);
      const sec = Number(match[2]);
      const ms = match[3] ? Number(match[3].padEnd(3, '0')) : 0;
      times.push(min * 60000 + sec * 1000 + ms);
    }
    const text = raw.replace(timeRe, '').trim();
    if (!text) continue;
    for (const t of times) {
      result.push({ timeMs: t, text });
    }
  }
  return result.sort((a, b) => a.timeMs - b.timeMs);
}
