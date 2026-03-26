export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Chat = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
};