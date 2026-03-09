"use client";

import { useState, useCallback } from "react";
import type { Message } from "@/app/api/chat/route";

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const STORAGE_KEY = "ai-chat-conversations";
const ACTIVE_KEY = "ai-chat-active-id";

function load(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {}
}

function getActiveId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACTIVE_KEY);
}

function setActiveId(id: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACTIVE_KEY, id);
}

function createConversation(): Conversation {
  return {
    id: crypto.randomUUID(),
    title: "新しい会話",
    messages: [],
    updatedAt: Date.now(),
  };
}

function deriveTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "新しい会話";
  return first.content.slice(0, 30) + (first.content.length > 30 ? "…" : "");
}

/** Initialize conversations from sessionStorage (lazy initializer — client-only) */
function initConversations(): Conversation[] {
  const saved = load();
  if (saved.length > 0) return saved;
  const fresh = createConversation();
  save([fresh]);
  return [fresh];
}

/** Initialize active conversation ID from sessionStorage (lazy initializer — client-only) */
function initActiveId(conversations: Conversation[]): string {
  const aid = getActiveId();
  const found = conversations.find((c) => c.id === aid);
  return found ? found.id : conversations[0].id;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(initConversations);
  const [activeId, setActiveIdState] = useState<string>(() =>
    initActiveId(initConversations())
  );

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const updateMessages = useCallback(
    (messages: Message[]) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === activeId
            ? { ...c, messages, title: deriveTitle(messages), updatedAt: Date.now() }
            : c
        );
        save(updated);
        return updated;
      });
    },
    [activeId]
  );

  const newConversation = useCallback(() => {
    const fresh = createConversation();
    setConversations((prev) => {
      const updated = [fresh, ...prev];
      save(updated);
      return updated;
    });
    setActiveIdState(fresh.id);
    setActiveId(fresh.id);
  }, []);

  const switchConversation = useCallback((id: string) => {
    setActiveIdState(id);
    setActiveId(id);
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        if (updated.length === 0) {
          const fresh = createConversation();
          save([fresh]);
          setActiveIdState(fresh.id);
          setActiveId(fresh.id);
          return [fresh];
        }
        save(updated);
        if (id === activeId) {
          setActiveIdState(updated[0].id);
          setActiveId(updated[0].id);
        }
        return updated;
      });
    },
    [activeId]
  );

  return {
    conversations,
    activeConversation,
    activeId,
    updateMessages,
    newConversation,
    switchConversation,
    deleteConversation,
  };
}
