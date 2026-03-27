"use client"

import { useEffect, useState, useContext, createContext } from "react";
import type { Chat, Message } from "@/types/chat";
import { loadChats, saveChats } from "@/lib/chat-storage";

type ChatContextType = {
    chats: Chat[];
    loaded: boolean;
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    updateChatMessages: (
        chatId: string,
        updater: (messages: Message[]) => Message[]
    ) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode}) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      const existing = loadChats();
      setChats(existing);
      setLoaded(true);
    }, []);

    useEffect(() => {
      if (!loaded) return;
      saveChats(chats);
    }, [chats, loaded]);

    const updateChatMessages = (
        chatId: string,
        updater: (messages: Message[]) => Message[],
    ) => {
      setChats((prev) => {
        const existing = prev.find((c) => c.id === chatId);

        if (!existing) {
          return [ 
            {
            id: chatId,
            name: "New Chat",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            messages: updater([]),
          },
          ...prev,
        ];
        }

        const nextMessages = updater(existing.messages);

        return prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: nextMessages,
              }
            : c,
        );
      });
    };

    return (
        <ChatContext.Provider value={{ chats, loaded, setChats, updateChatMessages }}>
            {children}
        </ChatContext.Provider>
    )
}
    
 export function useChatContext() {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChatContext must be used inside provider");
    return ctx;
 }  