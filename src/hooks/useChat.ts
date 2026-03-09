"use client";

import { useReducer, useCallback, useEffect } from "react";
import type { Message } from "@/app/api/chat/route";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type ChatAction =
  | { type: "SET_MESSAGES"; payload: Message[] }
  | { type: "ADD_USER_MESSAGE"; payload: Message }
  | { type: "START_ASSISTANT_MESSAGE" }
  | { type: "APPEND_ASSISTANT_TEXT"; payload: string }
  | { type: "SET_ERROR"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };

    case "ADD_USER_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };

    case "START_ASSISTANT_MESSAGE":
      return {
        ...state,
        isLoading: true,
        messages: [...state.messages, { role: "assistant", content: "" }],
      };

    case "APPEND_ASSISTANT_TEXT": {
      const messages = [...state.messages];
      const last = messages[messages.length - 1];
      if (last?.role === "assistant") {
        messages[messages.length - 1] = {
          ...last,
          content: last.content + action.payload,
        };
      }
      return { ...state, messages };
    }

    case "SET_ERROR":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        messages: [
          ...state.messages,
          { role: "assistant", content: action.payload },
        ],
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Custom hook
// ---------------------------------------------------------------------------

export function useChat(
  initialMessages: Message[],
  onMessagesChange?: (messages: Message[]) => void
) {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: initialMessages,
    isLoading: false,
    error: null,
  });

  // Sync when active conversation changes
  useEffect(() => {
    dispatch({ type: "SET_MESSAGES", payload: initialMessages });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessages.length === 0 ? 0 : initialMessages[0]?.content]);

  // Persist to conversation store when messages change (not during streaming)
  useEffect(() => {
    if (!state.isLoading && onMessagesChange && state.messages.length > 0) {
      onMessagesChange(state.messages);
    }
  }, [state.messages, state.isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || state.isLoading) return;

      const userMessage: Message = { role: "user", content: trimmed };
      dispatch({ type: "ADD_USER_MESSAGE", payload: userMessage });

      const messagesForApi = [...state.messages, userMessage];
      dispatch({ type: "START_ASSISTANT_MESSAGE" });

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messagesForApi }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                dispatch({ type: "APPEND_ASSISTANT_TEXT", payload: parsed.text });
              }
            } catch {
              // ignore JSON parse errors
            }
          }
        }
      } catch (err) {
        console.error("Chat error:", err);
        dispatch({
          type: "SET_ERROR",
          payload: "エラーが発生しました。もう一度お試しください。",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.isLoading, state.messages]
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
  };
}
