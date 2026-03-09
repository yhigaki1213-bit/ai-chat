import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatWindow from "./ChatWindow";
import type { Message } from "@/app/api/chat/route";

// jsdom は scrollIntoView を実装していないためモック
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: string }) => <pre><code>{children}</code></pre>,
}));
vi.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({
  oneDark: {},
}));

const userMsg: Message = { role: "user", content: "こんにちは" };
const assistantMsg: Message = { role: "assistant", content: "はじめまして！" };

describe("ChatWindow", () => {
  describe("空の状態", () => {
    it("メッセージがないとき空状態UIを表示する", () => {
      render(<ChatWindow messages={[]} isLoading={false} />);
      expect(screen.getByText("Claudeとチャットを始めましょう")).toBeInTheDocument();
    });

    it("空状態のサブテキストを表示する", () => {
      render(<ChatWindow messages={[]} isLoading={false} />);
      expect(screen.getByText("メッセージを入力して送信してください")).toBeInTheDocument();
    });
  });

  describe("メッセージ表示", () => {
    it("ユーザーメッセージを表示する", () => {
      render(<ChatWindow messages={[userMsg]} isLoading={false} />);
      expect(screen.getByText("こんにちは")).toBeInTheDocument();
    });

    it("アシスタントメッセージを表示する", () => {
      render(<ChatWindow messages={[assistantMsg]} isLoading={false} />);
      expect(screen.getByText("はじめまして！")).toBeInTheDocument();
    });

    it("複数メッセージを表示する", () => {
      render(<ChatWindow messages={[userMsg, assistantMsg]} isLoading={false} />);
      expect(screen.getByText("こんにちは")).toBeInTheDocument();
      expect(screen.getByText("はじめまして！")).toBeInTheDocument();
    });

    it("メッセージがあるとき空状態UIを表示しない", () => {
      render(<ChatWindow messages={[userMsg]} isLoading={false} />);
      expect(screen.queryByText("Claudeとチャットを始めましょう")).not.toBeInTheDocument();
    });
  });

  describe("ローディング", () => {
    it("isLoading=true かつ最後がユーザーメッセージのときタイピングインジケータを表示する", () => {
      render(<ChatWindow messages={[userMsg]} isLoading={true} />);
      const dots = document.querySelectorAll(".animate-bounce");
      expect(dots.length).toBeGreaterThan(0);
    });

    it("最後がアシスタントメッセージ（ストリーミング中）のときタイピングインジケータを表示しない", () => {
      const streaming: Message = { role: "assistant", content: "返答中..." };
      render(<ChatWindow messages={[userMsg, streaming]} isLoading={true} />);
      const dots = document.querySelectorAll(".animate-bounce");
      expect(dots.length).toBe(0);
    });

    it("isLoading=false のときタイピングインジケータを表示しない", () => {
      render(<ChatWindow messages={[userMsg]} isLoading={false} />);
      const dots = document.querySelectorAll(".animate-bounce");
      expect(dots.length).toBe(0);
    });
  });
});
