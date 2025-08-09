import { QueryClient } from "@tanstack/react-query";

let client: QueryClient | undefined;

export function getQueryClient() {
  if (!client) {
    client = new QueryClient();
  }
  return client;
}
