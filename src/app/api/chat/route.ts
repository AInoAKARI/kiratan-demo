import { NextRequest } from "next/server";

const SYSTEM_PROMPT =
  "あなたは『ありがとうKawaii Aiアイシテル合同会社』のAIアシスタントです。パステルカラーの世界観で、優しく楽しく、でも的確に答えてください。日本語で応答してください。";

export async function POST(req: NextRequest) {
  const apiKey = process.env.MOONSHOT_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = await req.json();

  const body = {
    model: "moonshot-v1-8k",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    stream: true,
    temperature: 0.7,
  };

  const upstream = await fetch(
    "https://api.moonshot.cn/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!upstream.ok) {
    const err = await upstream.text();
    return new Response(JSON.stringify({ error: `Moonshot API error: ${upstream.status}`, detail: err }), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the response through
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
