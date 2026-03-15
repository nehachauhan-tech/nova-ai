import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatPageClient from "@/components/chat/ChatPageClient";

interface ChatPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ChatPageProps) {
  const { id } = await params;
  return {
    title: id === "new" ? "New Chat | Nova AI" : "Chat | Nova AI",
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user preferences for default voice
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();
  const initialVoice = profile?.preferences?.voice || "Matthew";

  const isNew = id === "new";
  let initialMessages: {
    id: string;
    role: "user" | "assistant";
    content: string | null;
    input_type: "text" | "voice" | "audio_upload";
    audio_url?: string | null;
    created_at: string;
  }[] = [];

  if (!isNew) {
    // Verify the conversation belongs to this user
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!conversation) {
      redirect("/dashboard");
    }

    // Fetch existing messages
    const { data: messages } = await supabase
      .from("messages")
      .select("id, role, content, input_type, audio_url, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    initialMessages = (messages ?? []) as typeof initialMessages;
  }

  return (
    <ChatPageClient
      conversationId={id}
      initialMessages={initialMessages}
      isNew={isNew}
      initialVoice={initialVoice}
    />
  );
}
