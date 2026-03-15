import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  BedrockRuntimeClient,
  ConverseCommand,
  Message,
} from "@aws-sdk/client-bedrock-runtime";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

// Initialize AWS Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const MODEL_ID = process.env.AWS_BEDROCK_MODEL_ID || "amazon.nova-2-sonic-v1:0";

/**
 * Helper to build the system prompt based on user preferences.
 */
function buildSystemPrompt(preferences: any) {
  const style = preferences?.response_style || "concise";
  let instructions = "You are Nova AI, a highly capable, futuristic AI assistant.";

  switch (style) {
    case "concise":
      instructions += " Keep your answers direct, concise, and to the point.";
      break;
    case "detailed":
      instructions += " Provide detailed, comprehensive answers with explanations.";
      break;
    case "creative":
      instructions += " Be creative, enthusiastic, and conversational in your tone.";
      break;
    case "professional":
      instructions += " Maintain a strictly professional, formal tone. Avoid slang.";
      break;
  }

  return [{ text: instructions }];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, inputType, audioUrl, conversationId, modelId, voiceId } = body;

    // Fetch user preferences for the system prompt
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferences")
      .eq("id", user.id)
      .single();

    const systemPrompt = buildSystemPrompt(profile?.preferences);

    // Fetch conversation history
    // Fetch the LATEST 10 messages for context
    const { data: history } = await supabase
      .from("messages")
      .select("role, content, input_type, audio_url")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Reverse history to maintain chronological order [Oldest -> Newest]
    const chronologicalHistory = (history ?? []).reverse();

    // Build the messages payload for AWS Bedrock Nova
    const novaMessages: Message[] = [];

    // Map history to Bedrock format
    if (chronologicalHistory.length > 0) {
      for (const msg of chronologicalHistory) {
        if (!msg.content) continue;
        
        // Skip adding the exact current message if it somehow already exists in DB (to avoid duplicates)
        // because we append it manually below.
        if (inputType === "text" && msg.content === message) continue;
        if ((inputType === "voice" || inputType === "audio_upload") && msg.audio_url === audioUrl) continue;
        
        novaMessages.push({
          role: msg.role as "user" | "assistant",
          content: [{ text: msg.content }],
        });
      }
    }

    // Append current user message
    if (inputType === "text") {
      novaMessages.push({
        role: "user",
        content: [{ text: message }],
      });
    } else if (inputType === "voice" || inputType === "audio_upload") {
      novaMessages.push({
        role: "user",
        content: [
          {
            text: `[Audio Input received at ${audioUrl}]. Transcribe and respond appropriately. Note: Audio file processing over URL requires backend transcription first. For this demo, please acknowledge the audio receipt enthusiastically.`,
          },
        ],
      });
    }

    // Use cross-region inference profile prefix if not provided
    const defaultModel = MODEL_ID.includes("sonic") ? "amazon.nova-pro-v1:0" : MODEL_ID;
    let finalModelId = modelId || defaultModel;
    
    // Map standard model IDs to their cross-region inference profiles (us.*)
    const crossRegionMap: Record<string, string> = {
      "amazon.nova-pro-v1:0": "us.amazon.nova-pro-v1:0",
      "amazon.nova-2-lite-v1:0": "us.amazon.nova-2-lite-v1:0",
      "amazon.nova-lite-v1:0": "us.amazon.nova-lite-v1:0",
      "amazon.nova-micro-v1:0": "us.amazon.nova-micro-v1:0",
    };

    if (crossRegionMap[finalModelId]) {
      finalModelId = crossRegionMap[finalModelId];
    }

    // Call AWS Bedrock using the newer Converse API
    const command = new ConverseCommand({
      modelId: finalModelId,
      system: systemPrompt,
      messages: novaMessages,
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.7,
      },
    });

    const bedrockResponse = await bedrockClient.send(command);

    // The output format from Traverse/Converse API for Bedrock:
    const aiText = bedrockResponse.output?.message?.content?.[0]?.text 
      || "I couldn't process the response from the model. Please check the AWS configuration.";

    let audio_url = null;

    try {
      // Synthesize speech using AWS Polly
      const pollyClient = new PollyClient({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
      });

      const pollyCommand = new SynthesizeSpeechCommand({
        Engine: "neural",
        LanguageCode: "en-US",
        OutputFormat: "mp3",
        SampleRate: "24000",
        Text: aiText,
        TextType: "text",
        VoiceId: voiceId || profile?.preferences?.voice || "Matthew", 
      });

      const pollyResponse = await pollyClient.send(pollyCommand);
      
      if (pollyResponse.AudioStream) {
        // Convert stream to Buffer
        const audioArray = await pollyResponse.AudioStream.transformToByteArray();
        const audioBuffer = Buffer.from(audioArray);

        // Upload to Supabase chat-uploads
        const fileName = `${user.id}/${conversationId}/ai_response_${Date.now()}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from("chat-uploads")
          .upload(fileName, audioBuffer, {
            contentType: "audio/mpeg",
          });

        if (uploadError) {
          console.error("Supabase audio upload error:", uploadError);
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("chat-uploads")
            .getPublicUrl(fileName);
          audio_url = publicUrl;
        }
      }
    } catch (pollyError) {
      console.error("Polly TTS Error:", pollyError);
      // We don't throw here, we still want to return the text if audio fails.
    }

    return NextResponse.json({ response: aiText, audio_url });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
