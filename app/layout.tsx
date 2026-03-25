import { Geist, Geist_Mono } from "next/font/google";
import React from 'react'
import "./globals.css";
import { FaEdit } from "react-icons/fa";
import { GoKebabHorizontal } from "react-icons/go";
import Link from "next/link";

// interface AppProps {
//     children: React.ReactNode;
// }

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const chats = [{ name: "", talks: "" }];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-screen overflow-hidden flex w-full">
        <div className="w-[15%] bg-zinc-800 h-full flex flex-col justify-between items-center text-zinc-400">
          <div className="flex flex-col justify-between items-center w-full">
            <Link href="/" className="text-3xl flex justify-center p-4 border-b border-zinc-700 w-full">
              MyBot
            </Link>
            <Link
              href="/chat/newchat"
              className="flex gap-3 items-center p-2 border-2 hover:bg-gray-700/60 hover:text-white border-zinc-700 rounded-lg px-6 m-2 cursor-pointer"
            >
              <FaEdit className="size-5" />
              New Chat
            </Link>
            <div className="border-t border-zinc-700 w-full pt-4">
              <label className="text-sm p-2 text-zinc-500">Your Chats</label>
              <ul className="flex-1 px-4 py-2 overflow-y-auto space-y-1">
                {chats.map((chat, index) => (
                  <li
                    key={index}
                    className="border-2 border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg px-2 py-1 truncate flex items-center justify-between"
                  >
                    {chat.name}
                    <button className="rounded-full hover:bg-zinc-700 p-1 cursor-pointer">
                      <GoKebabHorizontal />
                    </button>
                  </li>
                ))}
                <li
                  key="1"
                  className="border-2 border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg px-2 py-1 truncate flex items-center justify-between"
                >
                  Chat 1
                  <button className="rounded-full hover:bg-zinc-700 p-1 cursor-pointer">
                    <GoKebabHorizontal />
                  </button>
                </li>
                <li
                  key="2"
                  className="border-2 border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg px-2 py-1 truncate flex items-center justify-between"
                >
                  Chat 2
                  <button className="rounded-full hover:bg-zinc-700 p-1 cursor-pointer">
                    <GoKebabHorizontal />
                  </button>
                </li>
                <li
                  key="3"
                  className="border-2 border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg px-2 py-1 truncate flex items-center justify-between"
                >
                  Chat 3
                  <button className="rounded-full hover:bg-zinc-700 p-1 cursor-pointer">
                    <GoKebabHorizontal />
                  </button>
                </li>
                <li
                  key="4"
                  className="border-2 border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg px-2 py-1 truncate flex items-center justify-between"
                >
                  Chat 4
                  <button className="rounded-full hover:bg-zinc-700 p-1 cursor-pointer">
                    <GoKebabHorizontal />
                  </button>
                </li>
                <li
                  key="5"
                  className="border-2 border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg px-2 py-1 truncate flex items-center justify-between"
                >
                  Chat 5
                  <button className="rounded-full hover:bg-zinc-700 p-1 cursor-pointer">
                    <GoKebabHorizontal />
                  </button>
                </li>
                <li
                  key="6"
                  className="border-2 border-zinc-600 hover:bg-zinc-700 hover:text-white rounded-lg px-2 py-1 truncate flex items-center justify-between"
                >
                  Chat 6
                  <button className="rounded-full hover:bg-zinc-700 p-1 cursor-pointer">
                    <GoKebabHorizontal />
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="p-4 text-xl border-t border-zinc-700 w-full">
            Guest User
          </div>
        </div>
        <div className="w-[85%]">{children}</div>
      </body>
    </html>
  );
}
