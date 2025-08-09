export type Track = {
  id: string;
  title: string;
  artistName?: string;
  albumName?: string;
  durationMs?: number;
  coverArtUrl?: string;
  streamUrl?: string;
};

export type ArtistSummary = {
  id: string;
  name: string;
};

export type AlbumSummary = {
  id: string;
  name: string;
  artistName?: string;
  coverArtUrl?: string;
};
