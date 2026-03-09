import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

export interface TextBlock {
  type: "text";
  text: string;
}

export interface ImageBlock {
  type: "image";
  media_type: ImageMediaType;
  data: string;
}

export type ContentBlock = TextBlock | ImageBlock;

export interface Message {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8096,
      messages: messages.map((m) => ({
        role: m.role,
        content:
          typeof m.content === "string"
            ? m.content
            : m.content.map((block) =>
                block.type === "image"
                  ? {
                      type: "image" as const,
                      source: {
                        type: "base64" as const,
                        media_type: block.media_type,
                        data: block.data,
                      },
                    }
                  : { type: "text" as const, text: block.text }
              ),
      })),
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
