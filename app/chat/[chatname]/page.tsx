"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import { useChatContext } from "@/components/ChatContext";

export default function NewChat() {
  const params = useParams<{ chatname: string }>();
  const chatId = params.chatname;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { chats, loaded, updateChatMessages, setChats } = useChatContext();
  const chat = chats.find((c) => c.id === chatId);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messages = useMemo(() => chat?.messages || [], [chat]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!message.trim() || loading) return;

    const userText = message.trim();
    const assistantId = crypto.randomUUID();

    setLoading(true);
    setError("");
    setMessage("");

    updateChatMessages(chatId, (prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: userText,
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
      },
    ]);

    const isFirstRes =
      (chat?.messages?.filter((m) => m.role === "assistant").length || 0) === 0;

    let firstRes = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText, chatId, history: messages }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to generate response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      let buffer = "";

      while (!done) {
        const result = await reader.read();
        done = result.done;

        if (result.value) {
          buffer += decoder.decode(result.value, { stream: true });
          firstRes = buffer;

          updateChatMessages(chatId, (prev) =>
            prev.map((msg) =>
              msg.id === assistantId ? { ...msg, content: buffer } : msg,
            ),
          );

          requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({
              behavior: "auto",
              block: "end",
            });
          });
        }
      }

      if (isFirstRes && firstRes.trim()) {
        try {
          const titleRes = await fetch("/api/chat-title", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstMsg: userText,
              firstRes,
            }),
          });

          if (!titleRes.ok) {
            throw new Error(`Title API failed: ${titleRes.status}`);
          }

          const titleData = await titleRes.json();

          if (titleData?.title) {
            setChats((prev) =>
              prev.map((c) =>
                c.id === chatId
                  ? {
                      ...c,
                      name: titleData.title,
                      updatedAt: Date.now(),
                    }
                  : c,
              ),
            );
          }
        } catch (error) {
          console.error("Failed to generate title", error);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");

      updateChatMessages(chatId, (prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "Failed to generate response." }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        Loading chat...
      </div>
    );
  }

  return (
    <div className="flex w-full h-[calc(100vh-60px)] flex-col justify-between gap-4">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-zinc-800 p-4 bg-zinc-950/40 ">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-zinc-500">
            Start the conversation
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-100"
                }`}
              >
                <div className="mb-1 text-xs uppercase tracking-wide opacity-70">
                  {msg.role}
                </div>
                  {msg.content ||
                    (loading && msg.role === "assistant" ? "..." : "")}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {error && (
          <div className="rounded-lg border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            name="message"
            value={message}
            placeholder={loading ? "Wait till previous response generate.... " : "EnterSomething"}
            disabled={loading}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-3 text-white outline-none"
          />
          <button
            className="border border-zinc-600 rounded-lg bg-zinc-800 py-3 px-4 cursor-pointer text-nowrap text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Generating.... " : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
