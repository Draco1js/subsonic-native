import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadCredentials, saveCredentials } from "@/lib/storage";
import { SubsonicClient, type SubsonicCredentials } from "@/lib/subsonic";

type SubsonicContextValue = {
  client: SubsonicClient | null;
  credentials: SubsonicCredentials | null;
  setCredentials: (creds: SubsonicCredentials | null) => void;
  lastError: string | null;
};

const SubsonicContext = createContext<SubsonicContextValue | undefined>(
  undefined,
);

export function SubsonicProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<SubsonicCredentials | null>(
    null,
  );
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const saved = await loadCredentials();
      if (saved) {
        setCredentials(saved);
      }
    })();
  }, []);

  const updateCredentials = async (creds: SubsonicCredentials | null) => {
    setCredentials(creds);
    await saveCredentials(creds);
    setLastError(null);
  };

  const client = useMemo(() => {
    return credentials ? new SubsonicClient(credentials) : null;
  }, [credentials]);

  useEffect(() => {
    void (async () => {
      if (!client) return;
      try {
        await client.ping();
        setLastError(null);
      } catch (e: any) {
        setLastError(e?.message ?? "Connection failed");
      }
    })();
  }, [client]);

  return (
    <SubsonicContext.Provider
      value={{
        client,
        credentials,
        setCredentials: updateCredentials,
        lastError,
      }}
    >
      {children}
    </SubsonicContext.Provider>
  );
}

export function useSubsonic() {
  const ctx = useContext(SubsonicContext);
  if (!ctx) throw new Error("useSubsonic must be used within SubsonicProvider");
  return ctx;
}
