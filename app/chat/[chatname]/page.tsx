"use client";

import { useParams } from "next/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import { useChatContext } from "@/components/ChatContext";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { TbCopy, TbCopyCheckFilled } from "react-icons/tb";
import "highlight.js/styles/github-dark.css";

export default function NewChat() {
  const params = useParams<{ chatname: string }>();
  const chatId = params.chatname;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastUserRef = useRef<HTMLDivElement | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { chats, loaded, updateChatMessages, setChats } = useChatContext();
  const chat = chats.find((c) => c.id === chatId);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const messages = useMemo(() => chat?.messages || [], [chat]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const CopyUrl = async (id: any) => {
    const currentMessage = messages.find((m) => m.id === id)?.content || "";
    await navigator.clipboard.writeText(currentMessage);
    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  useEffect(() => {
    if (loading) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSubmit = async () => {
    if (!message.trim() || loading) return;

    const userText = message.trim();
    const userId = crypto.randomUUID();
    const assistantId = crypto.randomUUID();
    setCurrentUserId(userId);

    setLoading(true);
    setError("");

    updateChatMessages(chatId, (prev) => [
      ...prev,
      {
        id: userId,
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

      setTimeout(() => {
        lastUserRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

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
      setMessage("");
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
      console.log(
        "messages:",
        messages.map((m) => ({ role: m.role, content: m.content })),
      );
      setLoading(false);
    }
  };

  function cleanMarkdown(text: string) {
    return (
      text
        // remove empty bullets
        .replace(/^\s*[-*]\s*$/gm, "")

        // remove bullets with only spaces
        .replace(/^\s*[-*]\s+\n/gm, "")

        // fix broken lists (merge lists separated by empty line)
        .replace(/\n\n(?=\s*[-*])/g, "\n")

        // remove excessive blank lines
        .replace(/\n{3,}/g, "\n\n")

        // remove leading blank lines
        .replace(/^\n+/, "")

        // remove trailing blank lines
        .replace(/\n+$/, "")

        // trim each line
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
    );
  }

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
            {messages.map((msg) => {
              const isCurrentUser =
                msg.role === "user" && msg.id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`max-w-[80%] relative rounded-2xl px-4 py-3 whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-100"
                  }`}
                >
                  {isCurrentUser && <div ref={lastUserRef} />}
                  <div className="mb-1 text-xs uppercase tracking-wide opacity-70">
                    {msg.role}
                  </div>
                  <div
                    className="
                    prose prose-invert max-w-none
                    prose-p:my-1
                    prose-li:my-0
                    prose-ul:my-1
                    prose-headings:mb-2 prose-headings:mt-3
                    leading-normal
                    "
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        li({ children }) {
                          const text = String(children).trim();
                          if (!text) return null;
                          return <li>{children}</li>;
                        },

                        p({ children }) {
                          const text = String(children).trim();
                          if (!text) return null; // ❌ remove empty paragraphs
                          return <p className="my-1">{children}</p>;
                        },

                        ul({ children }) {
                          return <ul className="my-1">{children}</ul>;
                        },
                      }}
                      skipHtml
                    >
                      {cleanMarkdown(
                        msg.content ||
                          (loading && msg.role === "assistant" ? "..." : ""),
                      )}
                    </ReactMarkdown>
                  </div>
                  <button
                    className={`absolute bottom-0 cursor-pointer hover:bg-zinc-700 p-2 rounded-full ${msg.role === "user" ? "-left-8" : "-right-8"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      CopyUrl(msg.id);
                    }}
                  >
                    {copiedId === msg.id ? <TbCopyCheckFilled /> : <TbCopy />}
                  </button>
                </div>
              );
            })}
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

        <div className="flex items-end gap-2">
          <textarea
            type="text"
            name="message"
            value={message}
            placeholder={
              loading
                ? "Wait till previous response generate.... "
                : "Enter Something"
            }
            disabled={loading}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            ref={textareaRef}
            onChange={(e) => {
              setMessage(e.target.value);

              const el = textareaRef.current;
              if (!el) return;

              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 240) + "px";
            }}
            className="
              w-full
              rounded-lg
              border border-zinc-600
              bg-zinc-800
              px-4 py-3
              text-white
              outline-none
              resize-none
              overflow-y-auto
            "
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
