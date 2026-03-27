import OpenAI from "openai";
import { title } from "process";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstMsg,
      firstRes,
    }: {
      firstMsg?: string;
      firstRes?: string;
    } = body;

    const soursetext = firstMsg?.trim() || firstRes?.trim() || "";
    if (!soursetext) {
      return new Response(JSON.stringify({ title: "New Chat" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await client.responses.create({
      model: process.env.MY_MODEL,
      input: [
        {
          role: "system",
          content:
            "Create a short chat title based on the message below, Return only the title. Keep it between 15 to 20 characters. No quotes. No punctuation unless necessary ",
        },
        {
          role: "user",
          content: soursetext,
        },
      ],
    });

    const rawTitle = response.output_text?.trim() || "New Chat";
    const title = rawTitle.slice(0, 20).trim() || "New Chat";

    console.log("title of message is :", title);

    return new Response(JSON.stringify({ title }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("Title generation error", error);

    return new Response(JSON.stringify({ title: "New Chat" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
