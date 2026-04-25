import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { headers } from "next/headers";
import { SYSTEM_PROMPT } from "@/lib/ai/knowledge-base";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getClientIp(headersList: Awaited<ReturnType<typeof headers>>): string {
  return (
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: Request) {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const headersList = await headers();
  const ip = getClientIp(headersList);

  const { success } = await checkRateLimit("chat:send", ip);
  if (!success) {
    return new Response(
      "Whoa there! You're talking a bit fast. Give Javier's AI a second to breathe.",
      {
        status: 429,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }

  // ── API key guard ──────────────────────────────────────────────────────────
  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      "The AI is currently resting. Please try again later or contact Javier on LinkedIn: https://www.linkedin.com/in/javierallvarez/",
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  // ── Stream response ────────────────────────────────────────────────────────
  try {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
    const { messages } = await req.json();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages,
      maxOutputTokens: 600,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    const isQuota =
      err instanceof Error &&
      (err.message.includes("quota") ||
        err.message.includes("RESOURCE_EXHAUSTED") ||
        err.message.includes("429"));

    const message = isQuota
      ? "The AI has reached its usage limit for now. Please try again in a few minutes or contact Javier on LinkedIn: https://www.linkedin.com/in/javierallvarez/"
      : "The AI is currently resting. Please try again later or contact Javier on LinkedIn: https://www.linkedin.com/in/javierallvarez/";

    return new Response(message, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
