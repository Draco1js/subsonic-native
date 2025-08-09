import React from "react";
import { Image, View } from "react-native";
import { useSubsonic } from "@/contexts/subsonic";

type Props = {
  coverArtId?: string | number | null;
  size?: number; // pixel size hint for server
  className?: string;
  rounded?: boolean;
};

export function CoverArt({
  coverArtId,
  size,
  className,
  rounded = true,
}: Props) {
  const { client } = useSubsonic();
  const [uri, setUri] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!client || !coverArtId) {
        setUri(null);
        return;
      }
      try {
        const url = await client.coverArtUrl(String(coverArtId), size);
        if (!cancelled) setUri(url);
      } catch {
        if (!cancelled) setUri(null);
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [client, coverArtId, size]);

  if (!uri) {
    return (
      <View className={className} style={{ borderRadius: rounded ? 8 : 0 }} />
    );
  }
  return (
    <Image
      source={{ uri }}
      className={className}
      style={{ borderRadius: rounded ? 8 : 0 }}
    />
  );
}
