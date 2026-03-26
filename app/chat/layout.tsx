import React from "react";
import Chatshell from "@/components/ChatShell";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <>
      <Chatshell>{children}</Chatshell>
    </>
  );
}
