"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Upload,
  ArrowLeft,
  Loader2,
  User,
  Bot,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | null;
  input_type: "text" | "voice" | "audio_upload";
  created_at: string;
}

interface ChatPageClientProps {
  conversationId: string;
  initialMessages: Message[];
  isNew: boolean;
}

export default function ChatPageClient({
  conversationId,
  initialMessages,
  isNew,
}: ChatPageClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(
    isNew ? null : conversationId
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Creates a new conversation if one doesn't exist yet.
   */
  const ensureConversation = async (): Promise<string> => {
    if (activeConvoId) return activeConvoId;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: input.slice(0, 60) || "New Chat" })
      .select("id")
      .single();

    if (error) throw error;

    setActiveConvoId(data.id);
    // Update URL without reloading
    window.history.replaceState(null, "", `/chat/${data.id}`);
    return data.id;
  };

  /**
   * Sends a text message.
   */
  const handleSendText = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      const convoId = await ensureConversation();

      // Optimistically add user message to the UI
      const tempUserMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        input_type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // Save user message to DB
      await supabase.from("messages").insert({
        conversation_id: convoId,
        role: "user",
        content: userMessage,
        input_type: "text",
      });

      // Call the chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convoId,
          message: userMessage,
          inputType: "text",
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to get response");

      // Add assistant response
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        input_type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Save assistant message to DB
      await supabase.from("messages").insert({
        conversation_id: convoId,
        role: "assistant",
        content: data.response,
        input_type: "text",
      });
    } catch (err) {
      console.error("Send text error:", err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        input_type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Starts/stops microphone recording.
   */
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        await handleAudioSubmit(audioBlob, "voice");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  };

  /**
   * Handles file upload for audio.
   */
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await handleAudioSubmit(file, "audio_upload");
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /**
   * Shared handler for audio (voice recording or file upload).
   */
  const handleAudioSubmit = async (
    audioBlob: Blob,
    inputType: "voice" | "audio_upload"
  ) => {
    setLoading(true);

    try {
      const convoId = await ensureConversation();

      // Upload audio to Supabase Storage
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileName = `${user.id}/${convoId}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from("chat-uploads")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-uploads").getPublicUrl(fileName);

      // Optimistic user message
      const tempUserMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: `[${inputType === "voice" ? "Voice Recording" : "Audio Upload"}]`,
        input_type: inputType,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      // Save user message
      await supabase.from("messages").insert({
        conversation_id: convoId,
        role: "user",
        content: `[${inputType === "voice" ? "Voice Recording" : "Audio Upload"}]`,
        input_type: inputType,
        audio_url: publicUrl,
      });

      // Call the chat API with the audio URL
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convoId,
          audioUrl: publicUrl,
          inputType,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to get response");

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        input_type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      await supabase.from("messages").insert({
        conversation_id: convoId,
        role: "assistant",
        content: data.response,
        input_type: "text",
      });
    } catch (err) {
      console.error("Audio submit error:", err);
      const errorMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't process the audio. Please try again.",
        input_type: "text",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendText();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-surface-border px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="btn-outline p-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-logo text-sm font-bold tracking-wider uppercase">
              NOVA AI
            </span>
          </Link>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">
                Start a conversation
              </h2>
              <p className="text-text-muted text-sm max-w-md mx-auto">
                Type a message, record your voice, or upload an audio file
                to begin.
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-md"
                    : "glass-card rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-text-muted" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-md">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-surface-border px-4 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          {/* Audio Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="btn-outline p-3 rounded-xl shrink-0 disabled:opacity-50"
            title="Upload audio file"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Voice Record */}
          <button
            onClick={toggleRecording}
            disabled={loading}
            className={`p-3 rounded-xl shrink-0 transition-all ${
              isRecording
                ? "bg-red-500/20 border border-red-500/40 text-red-400"
                : "btn-outline"
            } disabled:opacity-50`}
            title={isRecording ? "Stop recording" : "Start voice recording"}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-foreground placeholder:text-text-muted text-sm focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all resize-none"
            />
          </div>

          {/* Send */}
          <button
            onClick={handleSendText}
            disabled={loading || !input.trim()}
            className="btn-accent p-3 rounded-xl shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
