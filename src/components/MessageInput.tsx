"use client";

import { KeyboardEvent, useRef, useState, DragEvent } from "react";
import type { ImageAttachment } from "@/hooks/useChat";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (images: ImageAttachment[]) => void;
  isLoading: boolean;
}

const ACCEPTED_TYPES: Record<string, "image/jpeg" | "image/png" | "image/gif" | "image/webp"> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
  "image/gif": "image/gif",
  "image/webp": "image/webp",
};

async function fileToAttachment(file: File): Promise<ImageAttachment | null> {
  const mediaType = ACCEPTED_TYPES[file.type];
  if (!mediaType) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // strip "data:image/...;base64," prefix
      const data = result.split(",")[1];
      resolve({ data, media_type: mediaType, name: file.name });
    };
    reader.readAsDataURL(file);
  });
}

export default function MessageInput({ value, onChange, onSubmit, isLoading }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (!isLoading && (value.trim() || images.length > 0)) {
        handleSubmit();
      }
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const handleSubmit = () => {
    onSubmit(images);
    setImages([]);
  };

  const addFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const attachments = await Promise.all(arr.map(fileToAttachment));
    const valid = attachments.filter((a): a is ImageAttachment => a !== null);
    setImages((prev) => [...prev, ...valid]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-t transition-colors ${
        isDragging
          ? "border-indigo-400 dark:border-indigo-500"
          : "border-gray-200 dark:border-gray-700"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Image previews */}
      {images.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 pt-3 flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={`data:${img.media_type};base64,${img.data}`}
                alt={img.name}
                className="h-16 w-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-600 hover:bg-gray-800 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="画像を削除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-3 flex items-end gap-2">
        {/* Image attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="画像を添付"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={isDragging ? "ここに画像をドロップ..." : "メッセージを入力... (Enterで送信、Shift+Enterで改行)"}
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 disabled:bg-gray-50 dark:disabled:bg-gray-800 transition overflow-y-auto"
          style={{ minHeight: "48px", maxHeight: "160px" }}
        />

        <button
          onClick={handleSubmit}
          disabled={isLoading || (!value.trim() && images.length === 0)}
          aria-label="送信"
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white transition active:scale-95 flex-shrink-0"
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 pb-2">
        Claude Sonnet 4.6 · 画像はドラッグ&ドロップまたは
        <button onClick={() => fileInputRef.current?.click()} className="underline hover:text-gray-600 dark:hover:text-gray-300">
          クリックして添付
        </button>
      </p>
    </div>
  );
}
