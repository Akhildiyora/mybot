import type { Chat } from '@/types/chat';

const STORAGE_KEY = "mybot_chats";

export function loadChats(): Chat[] {
    if(typeof window === "undefined") return [];

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw) as Chat[];
        return Array.isArray(parsed) ? parsed : [];

    } catch {
        return [];
    }
}

export function saveChats(chats: Chat[]){
    if(typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function createChat(name?: string ): Chat {
    const id = crypto.randomUUID();
    const now = Date.now();

    return {
        id,
        name: "New Chat",
        createdAt: now,
        updatedAt: now,
        messages: [],
    }
}