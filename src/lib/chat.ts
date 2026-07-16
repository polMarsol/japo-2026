import { getSupabaseReady, syncEnabled } from "./supabase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function askGuide(
  messages: ChatMessage[],
  context: string | undefined,
): Promise<string> {
  if (!syncEnabled) {
    throw new Error("sync-disabled");
  }
  const client = await getSupabaseReady();
  if (!client) throw new Error("sync-disabled");

  const { data, error } = await client.functions.invoke<{ reply?: string; error?: string }>(
    "chat",
    { body: { messages, context } },
  );

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data?.reply ?? "";
}
