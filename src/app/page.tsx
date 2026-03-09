"use client";

import { useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import MessageInput from "@/components/MessageInput";
import Sidebar from "@/components/Sidebar";
import { useChat } from "@/hooks/useChat";
import { useConversations } from "@/hooks/useConversations";

export default function Home() {
  const {
    conversations,
    activeConversation,
    activeId,
    updateMessages,
    newConversation,
    switchConversation,
    deleteConversation,
  } = useConversations();

  const { messages, isLoading, sendMessage } = useChat(
    activeConversation?.messages ?? [],
    updateMessages
  );

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(text);
  };

  const handleNew = () => {
    newConversation();
    setInput("");
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onNew={handleNew}
        onSwitch={(id) => { switchConversation(id); setInput(""); }}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3 flex-shrink-0 transition-colors">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="メニューを開く"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">
            {activeConversation?.title ?? "新しい会話"}
          </h1>
        </header>

        <ChatWindow messages={messages} isLoading={isLoading} />
        <MessageInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
