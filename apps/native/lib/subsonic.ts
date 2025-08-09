import * as Crypto from "expo-crypto";

export type SubsonicCredentials = {
  baseUrl: string; // e.g. https://demo.subsonic.org
  username: string;
  password: string; // will be converted to token if desired
  appName?: string;
  appVersion?: string;
  useTokenAuth?: boolean; // if true, use token+salt auth
};

type Query = Record<string, string | number | boolean | undefined>;

function buildQuery(params: Query): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.append(key, String(value));
  }
  return search.toString();
}

async function generateToken(
  password: string,
): Promise<{ token: string; salt: string }> {
  const salt = Math.random().toString(36).slice(2, 10);
  const token = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.MD5,
    password + salt,
  );
  return { token, salt };
}

export class SubsonicClient {
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly appName: string;
  private readonly appVersion: string;
  private readonly useTokenAuth: boolean;

  constructor(creds: SubsonicCredentials) {
    const trimmed = creds.baseUrl.replace(/\/+$/, "");
    // If user enters .../rest, normalize to server root so requests don't become /rest/rest
    this.baseUrl = trimmed.endsWith("/rest") ? trimmed.slice(0, -5) : trimmed;
    this.username = creds.username;
    this.password = creds.password;
    this.appName = creds.appName ?? "subsonic-native";
    this.appVersion = creds.appVersion ?? "0.0.1";
    this.useTokenAuth = creds.useTokenAuth ?? true;
  }

  private async authParams(): Promise<Query> {
    if (this.useTokenAuth) {
      const { token, salt } = await generateToken(this.password);
      return {
        u: this.username,
        t: token,
        s: salt,
        c: this.appName,
        v: "1.16.1",
        f: "json",
      };
    }
    return {
      u: this.username,
      p: this.password,
      c: this.appName,
      v: "1.16.1",
      f: "json",
    };
  }

  private async request<T>(endpoint: string, params: Query = {}): Promise<T> {
    const url = `${this.baseUrl}/rest/${endpoint}.view?${buildQuery({
      ...(await this.authParams()),
      ...params,
    })}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Subsonic request failed: ${res.status}`);
    }
    const json = (await res.json()) as any;
    if (!json["subsonic-response"]) {
      throw new Error("Invalid Subsonic response");
    }
    const response = json["subsonic-response"];
    if (response.status !== "ok") {
      const code = response.error?.code;
      const message = response.error?.message ?? "Unknown error";
      throw new Error(`Subsonic error ${code}: ${message}`);
    }
    return response as T;
  }

  // Library
  getArtists() {
    return this.request<{
      "subsonic-response": {
        artists: {
          index: Array<{
            name: string;
            artist: Array<{ id: string; name: string }>;
          }>;
        };
        status: "ok";
      };
    }>("getArtists");
  }

  // Health check
  ping() {
    return this.request("ping");
  }

  getArtist(params: { id: string }) {
    return this.request("getArtist", params);
  }

  getAlbum(params: { id: string }) {
    return this.request("getAlbum", params);
  }

  getSong(params: { id: string }) {
    return this.request("getSong", params);
  }

  // Search
  search(params: {
    query: string;
    artistCount?: number;
    albumCount?: number;
    songCount?: number;
  }) {
    return this.request("search3", {
      query: params.query,
      artistCount: params.artistCount ?? 5,
      albumCount: params.albumCount ?? 10,
      songCount: params.songCount ?? 25,
    });
  }

  // Playlists
  getPlaylists() {
    return this.request("getPlaylists");
  }

  getPlaylist(params: { id: string }) {
    return this.request("getPlaylist", params);
  }

  // Streaming
  streamUrl(songId: string, extra?: Query) {
    // Note: caller should await since auth params are async
    return (async () => {
      const query = buildQuery({
        ...(await this.authParams()),
        id: songId,
        ...extra,
      });
      return `${this.baseUrl}/rest/stream.view?${query}`;
    })();
  }

  coverArtUrl(coverArtId?: string, size?: number) {
    if (!coverArtId) return null;
    return (async () => {
      const query = buildQuery({
        ...(await this.authParams()),
        id: coverArtId,
        size,
      });
      return `${this.baseUrl}/rest/getCoverArt.view?${query}`;
    })();
  }

  // Discovery / lists
  getAlbumList2(params: {
    type: "random" | "newest" | "highest" | "frequent" | "recent";
    size?: number;
    offset?: number;
  }) {
    return this.request("getAlbumList2", params as Query);
  }

  getStarred2() {
    return this.request("getStarred2");
  }
}
