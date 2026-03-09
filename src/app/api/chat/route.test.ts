import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Anthropic SDK をクラスとしてモック（new Anthropic() に対応）
vi.mock("@anthropic-ai/sdk", () => {
  class MockAnthropic {
    messages = {
      stream: vi.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield {
            type: "content_block_delta",
            delta: { type: "text_delta", text: "Hello" },
          };
          yield {
            type: "content_block_delta",
            delta: { type: "text_delta", text: " World" },
          };
        },
      }),
    };
  }
  return { default: MockAnthropic };
});

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("バリデーション", () => {
    it("messages が未指定のとき 400 を返す", async () => {
      const { POST } = await import("./route");
      const res = await POST(makeRequest({}));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBeDefined();
    });

    it("messages が空配列のとき 400 を返す", async () => {
      const { POST } = await import("./route");
      const res = await POST(makeRequest({ messages: [] }));
      expect(res.status).toBe(400);
    });

    it("messages が配列でないとき 400 を返す", async () => {
      const { POST } = await import("./route");
      const res = await POST(makeRequest({ messages: "invalid" }));
      expect(res.status).toBe(400);
    });
  });

  describe("正常系", () => {
    it("有効なメッセージでストリーミングレスポンスを返す", async () => {
      const { POST } = await import("./route");
      const res = await POST(makeRequest({ messages: [{ role: "user", content: "Hello" }] }));
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/event-stream");
      expect(res.headers.get("Cache-Control")).toBe("no-cache");
    });

    it("SSE 形式でテキストをストリーミングする", async () => {
      const { POST } = await import("./route");
      const res = await POST(makeRequest({ messages: [{ role: "user", content: "Hello" }] }));
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let output = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
      }
      expect(output).toContain("data:");
      expect(output).toContain("[DONE]");
      expect(output).toContain("Hello");
      expect(output).toContain("World");
    });

    it("複数ターンの会話履歴を受け付ける", async () => {
      const { POST } = await import("./route");
      const res = await POST(makeRequest({
        messages: [
          { role: "user", content: "Hi" },
          { role: "assistant", content: "Hello!" },
          { role: "user", content: "How are you?" },
        ],
      }));
      expect(res.status).toBe(200);
    });
  });
});
