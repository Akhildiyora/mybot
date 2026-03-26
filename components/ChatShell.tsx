"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Popup from "reactjs-popup";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaEdit } from "react-icons/fa";
import { GoKebabHorizontal } from "react-icons/go";

import type { Chat, Message } from "@/types/chat";
import { createChat, loadChats, saveChats } from "@/lib/chat-storage";

type Props = {
  children?: React.ReactNode;
};

export default function Chatshell({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

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

  const activeChatId = useMemo(() => {
    const parts = pathname.split("/");
    return parts[2] || "";
  }, [pathname]);

  const handleNewChat = () => {
    const chat = createChat();
    setChats((prev) => [chat, ...prev]);
    router.push(`/chat/${chat.id}`);
  };

  const handleDeleteChat = (chatId: string) => {
    const updated = chats.filter((chat) => chat.id !== chatId);
    setChats(updated);

    if (activeChatId === chatId) {
      router.push("/chat");
    }
  };

  const handleRenameChat = (chatId: string) => {
    const current = chats.find((c) => c.id === chatId);
    const nextName = window.prompt("Rename chat", current?.name || "");
    if (!nextName?.trim()) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, name: nextName.trim(), updatedAt: Date.now() }
          : chat,
      ),
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden ">
      <div className="w-[18%] z-10 bg-zinc-800 min-w-[240px] h-full flex flex-col justify-between text-zinc-400">
        <div className="flex flex-col items-center w-full">
          <Link
            href="/"
            className="text-3xl text-white flex justify-center p-4 border-b border-zinc-700 w-full"
          >
            MyBot
          </Link>
          <button
            onClick={handleNewChat}
            className="flex gap-3 items-center border-2 hover:bg-gray-700/60 hover:text-white border-zinc-700 rounded-lg px-6 py-2 m-2 cursor-pointer"
          >
            <FaEdit className="size-5" />
            New Chat
          </button>
          <div className="border-t border-zinc-700 w-full pt-4">
            <label className="text-sm p-2 text-zinc-500">Your Chats</label>
            <ul className="px-4 py-2 overflow-y-auto space-y-1">
              {chats.length === 0 && (
                <li className="rounded-lg border border-dashed border-zinc-600 px-3 py-3 text-sm text-zinc-500">
                  No chats yet
                </li>
              )}

              {chats
                .slice()
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((chat) => {
                  const isActive = activeChatId === chat.id;
                  return (
                    <li
                      key={chat.id}
                      className={`flex items-center justify-between rounded-lg border-2 px-2 py-2 ${
                        isActive
                          ? "border-zinc-400 bg-zinc-700 text-white"
                          : "border-zinc-600 hover:bg-zinc-700 hover:text-white"
                      }`}
                    >
                      <Link
                        href={`/chat/${chat.id}`}
                        className="block flex-1 truncate"
                        title={chat.name}
                      >
                        {chat.name}
                      </Link>

                      <Popup
                        trigger={<button
                            className="rounded-full hover:bg-zinc-600 p-1.5 cursor-pointer"
                            onClick={() => handleRenameChat(chat.id)}   
                            title="Rename"
                          >
                            <GoKebabHorizontal />
                          </button>}
                        position="right center"
                      >
                        <div className="flex flex-col items-center gap-1 bg-zinc-900 rounded-xl border border-zinc-600 p-2">
                          <button
                            className="rounded-full flex items-center justify-items-start gap-2 hover:bg-zinc-600 p-1 cursor-pointer"
                            onClick={() => handleRenameChat(chat.id)}
                            title="Rename"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            className="cursor-pointer flex items-center justify-items-start gap-2 rounded px-2 py-1 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDeleteChat(chat.id)}
                          >
                            <RiDeleteBin6Line />Delete 
                          </button>
                        </div>
                      </Popup>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
        <div className="p-4 text-xl text-white border-t border-zinc-700 w-full">
          Guest User
        </div>
      </div>
      <div className="bg-zinc-900 h-full w-[85%] p-4 ">
        <div className="mb-4 text-white">
          <span className="text-sm text-zinc-400">model:</span>
          <span className="font-bold">gpt-5-nano</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function useChatState(chatId: string) {
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

  const chat = chats.find((c) => c.id === chatId);

  const ensureChat = () => {
    const existing = chats.find((c) => c.id === chatId);
    if (existing) return existing;

    const fresh: Chat = {
      id: chatId,
      name: "New Chat",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    setChats((prev) => [fresh, ...prev]);
    return fresh;
  };

  const updateChatMessages = (updater: (messages: Message[]) => Message[]) => {
    setChats((prev) => {
      const existing = prev.find((c) => c.id === chatId);

      if (!existing) {
        const fresh: Chat = {
          id: chatId,
          name: "New Chat",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: updater([]),
        };
        return [fresh, ...prev];
      }

      const nextMessages = updater(existing.messages);

      const nextName =
        existing.name === "New Chat" && nextMessages.length > 0
          ? nextMessages[0].content.slice(0, 30) || "New Chat"
          : existing.name;

      return prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              name: nextName,
              updatedAt: Date.now(),
              messages: nextMessages,
            }
          : c,
      );
    });
  };

  return {
    chats,
    chat,
    loaded,
    ensureChat,
    updateChatMessages,
  };
}
