import { ScrollView, Text, View } from "react-native";
import { Container } from "@/components/container";

export default function DownloadsScreen() {
  return (
    <Container>
      <ScrollView className="flex-1 p-6">
        <View className="py-8">
          <Text className="mb-2 font-bold text-3xl text-foreground">
            Downloads
          </Text>
          <Text className="text-lg text-muted-foreground">
            Manage offline music and cache
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}
