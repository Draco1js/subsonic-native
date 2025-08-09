import type React from "react";
import { createContext, useContext, useMemo, useState } from "react";

type PlayerUIContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const PlayerUIContext = createContext<PlayerUIContextValue | undefined>(
  undefined,
);

export function PlayerUIProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<PlayerUIContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((v) => !v),
    }),
    [isOpen],
  );

  return (
    <PlayerUIContext.Provider value={value}>
      {children}
    </PlayerUIContext.Provider>
  );
}

export function usePlayerUI() {
  const ctx = useContext(PlayerUIContext);
  if (!ctx) throw new Error("usePlayerUI must be used within PlayerUIProvider");
  return ctx;
}
