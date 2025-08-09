import * as SecureStore from "expo-secure-store";
import type { SubsonicCredentials } from "@/lib/subsonic";

const CREDS_KEY = "subsonic.credentials.v1";

export async function saveCredentials(creds: SubsonicCredentials | null) {
  if (!creds) {
    await SecureStore.deleteItemAsync(CREDS_KEY);
    return;
  }
  await SecureStore.setItemAsync(CREDS_KEY, JSON.stringify(creds));
}

export async function loadCredentials(): Promise<SubsonicCredentials | null> {
  try {
    const json = await SecureStore.getItemAsync(CREDS_KEY);
    if (!json) return null;
    return JSON.parse(json) as SubsonicCredentials;
  } catch {
    return null;
  }
}
