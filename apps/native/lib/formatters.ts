import type { SubsonicClient } from "@/lib/subsonic";
import type { Track } from "@/types/music";

export async function buildTracksFromSongs(
  client: SubsonicClient,
  songs: any[] | undefined | null,
): Promise<Track[]> {
  if (!songs || songs.length === 0) return [];
  const tracks = await Promise.all(
    songs.map(async (s: any) => {
      const streamUrl = await client.streamUrl(String(s.id));
      const coverArtUrl = s.coverArt
        ? await client.coverArtUrl(String(s.coverArt))
        : null;
      return {
        id: String(s.id),
        title: String(s.title ?? s.name ?? "Unknown"),
        artistName: s.artist ?? s.artistName ?? undefined,
        albumName: s.album ?? s.albumName ?? undefined,
        durationMs:
          typeof s.duration === "number" ? s.duration * 1000 : undefined,
        coverArtUrl: coverArtUrl ?? undefined,
        streamUrl,
      } as Track;
    }),
  );
  return tracks;
}
