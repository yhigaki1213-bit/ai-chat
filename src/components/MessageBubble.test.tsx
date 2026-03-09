import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MessageBubble from "./MessageBubble";

// react-syntax-highlighter is heavy — stub it in tests
vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children, language }: { children: string; language: string }) => (
    <pre data-testid="code-block" data-language={language}>
      <code>{children}</code>
    </pre>
  ),
}));
vi.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({
  oneDark: {},
}));

describe("MessageBubble", () => {
  describe("ユーザーメッセージ", () => {
    it("テキストが表示される", () => {
      render(<MessageBubble message={{ role: "user", content: "こんにちは" }} />);
      expect(screen.getByText("こんにちは")).toBeInTheDocument();
    });

    it("U アバターが表示される", () => {
      render(<MessageBubble message={{ role: "user", content: "test" }} />);
      expect(screen.getByText("U")).toBeInTheDocument();
    });

    it("改行を含むメッセージが表示される", () => {
      const { container } = render(
        <MessageBubble message={{ role: "user", content: "line1\nline2" }} />
      );
      // whitespace-pre-wrap で改行が保持される <p> 要素を確認
      const p = container.querySelector("p.whitespace-pre-wrap");
      expect(p?.textContent).toBe("line1\nline2");
    });
  });

  describe("アシスタントメッセージ", () => {
    it("AI アバターが表示される", () => {
      render(<MessageBubble message={{ role: "assistant", content: "こんにちは" }} />);
      expect(screen.getByText("AI")).toBeInTheDocument();
    });

    it("Markdown の段落が描画される", () => {
      render(<MessageBubble message={{ role: "assistant", content: "Hello world" }} />);
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });

    it("Markdown の見出しが描画される", () => {
      render(<MessageBubble message={{ role: "assistant", content: "# タイトル" }} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("タイトル");
    });

    it("Markdown のリストが描画される", () => {
      render(
        <MessageBubble
          message={{ role: "assistant", content: "- アイテム1\n- アイテム2" }}
        />
      );
      expect(screen.getByText("アイテム1")).toBeInTheDocument();
      expect(screen.getByText("アイテム2")).toBeInTheDocument();
    });

    it("コードブロックがシンタックスハイライト付きで描画される", () => {
      render(
        <MessageBubble
          message={{
            role: "assistant",
            content: "```typescript\nconst x = 1;\n```",
          }}
        />
      );
      expect(screen.getByTestId("code-block")).toBeInTheDocument();
      expect(screen.getByTestId("code-block")).toHaveAttribute(
        "data-language",
        "typescript"
      );
    });

    it("インラインコードが描画される", () => {
      render(
        <MessageBubble
          message={{ role: "assistant", content: "Use `useState` hook" }}
        />
      );
      expect(screen.getByText("useState")).toBeInTheDocument();
    });

    it("リンクが target=_blank で描画される", () => {
      render(
        <MessageBubble
          message={{
            role: "assistant",
            content: "[Next.js](https://nextjs.org)",
          }}
        />
      );
      const link = screen.getByRole("link", { name: "Next.js" });
      expect(link).toHaveAttribute("href", "https://nextjs.org");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("空のコンテンツでも描画できる（ストリーミング開始時）", () => {
      const { container } = render(
        <MessageBubble message={{ role: "assistant", content: "" }} />
      );
      expect(container).toBeInTheDocument();
    });
  });
});
