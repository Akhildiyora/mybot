import { ChatProvider } from "@/components/ChatContext";
import ChatShell from "@/components/ChatShell";
import React from "react";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return <ChatProvider><ChatShell>{children}</ChatShell></ChatProvider>;
}
