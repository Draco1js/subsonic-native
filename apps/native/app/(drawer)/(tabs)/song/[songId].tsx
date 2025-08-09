import { useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";

export default function SongScreen() {
  const { songId } = useLocalSearchParams<{ songId: string }>();
  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="py-8">
          <Text className="mb-2 font-bold text-3xl text-foreground">Song</Text>
          <Text className="text-muted-foreground">ID: {songId}</Text>
        </View>
      </ScrollView>
    </Container>
  );
}
