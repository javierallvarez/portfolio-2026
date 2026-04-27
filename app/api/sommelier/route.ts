import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { db } from "@/lib/db";
import { vinyls } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/** Edge avoids Node streaming buffering quirks with Gemini text streams on Vercel. */
export const runtime = "edge";

export const dynamic = "force-dynamic";

const SOMMELIER_SYSTEM_PROMPT = `You are Javier's Vinyl Sommelier — a warm, enthusiastic, and slightly theatrical guide to his record collection.

Your job: based strictly on the list of vinyl records provided below, recommend exactly ONE album that perfectly matches what the user is doing or feeling right now.

Rules:
- You MUST pick a record from the provided list. Never invent albums.
- Keep your recommendation to one short, fun paragraph (3-5 sentences max).
- Start by naming the record: "I recommend [Artist] — [Title]."
- Then explain WHY it fits their mood or task in a warm, personal way.
- End with a single evocative sentence about why this record is special.
- Be enthusiastic but not over the top. Think knowledgeable friend at a record store, not a corporate chatbot.`;

function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

/** Gemini default safety thresholds can false-positive and truncate streams for benign vinyl copy. */
const SOMMELIER_SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_HATE_SPEECH" as const, threshold: "BLOCK_NONE" as const },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as const, threshold: "BLOCK_NONE" as const },
  { category: "HARM_CATEGORY_HARASSMENT" as const, threshold: "BLOCK_NONE" as const },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as const, threshold: "BLOCK_NONE" as const },
];

export async function POST(req: Request) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return new Response(
      "The Sommelier is resting right now. Check back soon or contact Javier on LinkedIn!",
      { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  try {
    const { mood } = (await req.json()) as { mood?: string };

    if (!mood?.trim()) {
      return new Response("Please tell me your mood or task first!", {
        status: 400,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // Fetch only in_collection vinyls — the sommelier works from Javier's actual shelf
    let collection: { artist: string; title: string; genre: string | null }[] = [];
    try {
      collection = await db
        .select({ artist: vinyls.artist, title: vinyls.title, genre: vinyls.genre })
        .from(vinyls)
        .where(eq(vinyls.status, "in_collection"));
    } catch {
      return new Response("I can't reach the record shelf right now. Try again in a moment!", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (collection.length === 0) {
      return new Response("The collection is empty right now! Add some records and come back.", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const vinylList = collection
      .map((v) => `- ${v.artist} · ${v.title}${v.genre ? ` (${v.genre})` : ""}`)
      .join("\n");

    const google = createGoogleGenerativeAI({ apiKey });

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: `${SOMMELIER_SYSTEM_PROMPT}\n\nJavier's vinyl collection:\n${vinylList}`,
      messages: [
        {
          role: "user",
          content: `I'm currently: ${mood.trim()}. What record should I put on?`,
        },
      ],
      maxOutputTokens: 500,
      providerOptions: {
        google: {
          safetySettings: SOMMELIER_SAFETY_SETTINGS,
        },
      },
      onFinish: (event) =>
        // eslint-disable-next-line no-console -- intentional stream diagnostics (see JAG-011)
        console.log(
          "Sommelier Stream finished. Reason:",
          event.finishReason,
          "Usage:",
          event.usage,
        ),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Sommelier API Error]:", error);
    return new Response("Something went sideways in the cellar. Try again in a moment!", {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
