import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageInput from "./MessageInput";

function setup(props: Partial<Parameters<typeof MessageInput>[0]> = {}) {
  const defaults = {
    value: "",
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    isLoading: false,
  };
  const merged = { ...defaults, ...props };
  render(<MessageInput {...merged} />);
  return merged;
}

describe("MessageInput", () => {
  describe("描画", () => {
    it("テキストエリアが描画される", () => {
      setup();
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("送信ボタンが描画される", () => {
      setup();
      expect(screen.getByRole("button", { name: "送信" })).toBeInTheDocument();
    });

    it("プレースホルダーが表示される", () => {
      setup();
      expect(
        screen.getByPlaceholderText(/メッセージを入力/)
      ).toBeInTheDocument();
    });
  });

  describe("入力", () => {
    it("入力時に onChange が呼ばれる", async () => {
      const onChange = vi.fn();
      setup({ onChange });
      await userEvent.type(screen.getByRole("textbox"), "Hello");
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("送信", () => {
    it("Enterキーで onSubmit が呼ばれる（テキストあり）", async () => {
      const onSubmit = vi.fn();
      setup({ value: "Hello", onSubmit });
      const textarea = screen.getByRole("textbox");
      await userEvent.click(textarea);
      await userEvent.keyboard("{Enter}");
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("Shift+Enterでは onSubmit が呼ばれない", async () => {
      const onSubmit = vi.fn();
      setup({ value: "Hello", onSubmit });
      await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("送信ボタンクリックで onSubmit が呼ばれる", async () => {
      const onSubmit = vi.fn();
      setup({ value: "Hello", onSubmit });
      await userEvent.click(screen.getByRole("button", { name: "送信" }));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("無効状態", () => {
    it("value が空のとき送信ボタンは disabled", () => {
      setup({ value: "" });
      expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
    });

    it("isLoading=true のとき送信ボタンは disabled", () => {
      setup({ value: "Hello", isLoading: true });
      expect(screen.getByRole("button", { name: "送信" })).toBeDisabled();
    });

    it("isLoading=true のときテキストエリアは disabled", () => {
      setup({ isLoading: true });
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("isLoading=true のときスピナーが表示される", () => {
      const { container } = render(
        <MessageInput value="Hello" onChange={vi.fn()} onSubmit={vi.fn()} isLoading={true} />
      );
      // スピナーSVGはボタン内に存在する
      const btn = screen.getByRole("button", { name: "送信" });
      expect(btn.querySelector("svg")).toBeInTheDocument();
    });
  });
});
