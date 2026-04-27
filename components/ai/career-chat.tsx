"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bot, User, Send, X, Sparkles, ExternalLink } from "lucide-react";
import { useCareerChat } from "@/hooks/use-career-chat";
import { stripLocale } from "@/lib/i18n/utils";
import { LINKEDIN_PROFILE_URL } from "@/lib/social";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CareerChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Path-aware UX (starters + placeholder) ───────────────────────────────────

function getChatStarters(pathname: string): string[] {
  const p = pathname || "/";
  if (p === "/internal-tooling" || p.startsWith("/internal-tooling/")) {
    return ["Explain the HR webhook pipeline.", "Why use Python & Jenkins?"];
  }
  if (p === "/tools" || p.startsWith("/tools/")) {
    return ["How does the Password Generator work?", "Is the JWT decoder secure?"];
  }
  if (p === "/under-the-hood" || p.startsWith("/under-the-hood/")) {
    return ["Explain the database telemetry.", "Why Upstash for rate limiting?"];
  }
  if (p === "/interactive-lab" || p.startsWith("/interactive-lab/")) {
    return ["Ask the Sommelier for a vinyl.", "How does the RAG system work?"];
  }
  return ["What are Javier's soft skills?", "Summarize his CV."];
}

function getChatPlaceholder(pathname: string): string {
  const p = pathname || "/";
  if (p === "/internal-tooling" || p.startsWith("/internal-tooling/")) {
    return "Ask about this system architecture…";
  }
  if (p === "/tools" || p.startsWith("/tools/")) {
    return "Ask about these developer utilities…";
  }
  if (p === "/under-the-hood" || p.startsWith("/under-the-hood/")) {
    return "Ask about this stack, telemetry, or security…";
  }
  if (p === "/interactive-lab" || p.startsWith("/interactive-lab/")) {
    return "Ask about vinyls, Discogs, or the Sommelier…";
  }
  return "Ask about Javier's career…";
}

/** Empty-state blurb: names the current section so context-awareness is obvious. */
function ChatEmptyIntro({ pathname }: { pathname: string }) {
  const p = pathname || "/";

  if (p === "/tools" || p.startsWith("/tools/")) {
    return (
      <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
        I see you&apos;re exploring Javier&apos;s{" "}
        <strong className="font-medium text-zinc-200">Developer Utilities</strong>. I can explain
        how the JWT Decoder is secured or how the Password Generator works.
      </p>
    );
  }
  if (p === "/internal-tooling" || p.startsWith("/internal-tooling/")) {
    return (
      <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
        I see you&apos;re looking at Javier&apos;s{" "}
        <strong className="font-medium text-zinc-200">Automation Architecture</strong>. Want to know
        more about the Jenkins pipeline or Slack webhooks?
      </p>
    );
  }
  if (p === "/under-the-hood" || p.startsWith("/under-the-hood/")) {
    return (
      <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
        I see you&apos;re on <strong className="font-medium text-zinc-200">Under the Hood</strong>,
        Javier&apos;s technical deep dive. Ask about Terraform, CI/CD, live database telemetry, or
        how this site is wired together.
      </p>
    );
  }
  if (p === "/interactive-lab" || p.startsWith("/interactive-lab/")) {
    return (
      <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
        I see you&apos;re in the{" "}
        <strong className="font-medium text-zinc-200">Interactive Lab</strong>, the live vinyl
        collection and Discogs integration. Ask about the Vinyl Sommelier, Neon + Drizzle, or how
        recommendations work.
      </p>
    );
  }
  return (
    <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
      Hi! I&apos;m Javier&apos;s AI. I can navigate this portfolio with you. Ask me about his career
      or the tech stack behind this very website!
    </p>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({
  role,
  content,
  isStreaming,
}: {
  role: "user" | "assistant";
  content: string;
  isStreaming: boolean;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white",
          isUser ? "bg-teal-500" : "bg-zinc-700",
        ].join(" ")}
      >
        {isUser ? (
          <User size={14} aria-hidden="true" />
        ) : (
          <Bot size={14} className="text-teal-400" aria-hidden="true" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={[
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-teal-500 text-white"
            : "rounded-tl-sm bg-zinc-800 text-zinc-100",
        ].join(" ")}
      >
        {content}
        {/* Blinking cursor while streaming this message */}
        {isStreaming && !isUser && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-teal-400 align-middle" />
        )}
      </div>
    </div>
  );
}

// ─── Career Chat Drawer ────────────────────────────────────────────────────────

export function CareerChat({ isOpen, onClose }: CareerChatProps) {
  const pathname = usePathname();
  const logicalPath = stripLocale(pathname);
  const { messages, input, setInput, isStreaming, sendMessage, appendAndSend, reset } =
    useCareerChat(logicalPath);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const starters = useMemo(() => getChatStarters(logicalPath), [logicalPath]);
  const inputPlaceholder = useMemo(() => getChatPlaceholder(logicalPath), [logicalPath]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — button so keyboard / SR users get a named dismiss control */}
      <button
        type="button"
        tabIndex={-1}
        className="fixed inset-0 z-[150] cursor-default border-0 bg-black/40 p-0 backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        aria-label="Close career chat"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="AI Career Chat"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-[160] flex w-full flex-col bg-zinc-900 shadow-2xl sm:w-[420px]"
      >
        {/* ── Header ── */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500/15 ring-1 ring-teal-500/30">
            <Bot size={18} className="text-teal-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-base leading-tight font-normal text-white">
              Ask Javier&apos;s <span className="gradient-heading">AI Agent</span>
            </p>
            <p className="truncate text-xs text-zinc-500">Career · Projects · Knows this page</p>
          </div>
          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors outline-none hover:bg-zinc-800 hover:text-zinc-300 focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
                aria-label="Clear conversation"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors outline-none hover:bg-zinc-800 hover:text-zinc-300 focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
              aria-label="Close career chat"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center gap-5 pt-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20">
                <Sparkles size={26} className="text-teal-400" />
              </div>
              <div className="space-y-1.5">
                <p className="font-serif text-lg font-normal text-white">
                  Hi! I&apos;m Javier&apos;s AI
                </p>
                <ChatEmptyIntro pathname={logicalPath} />
              </div>

              {/* Starter chips */}
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                {starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void appendAndSend(s)}
                    disabled={isStreaming}
                    aria-label={`Ask: ${s}`}
                    className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors outline-none hover:border-teal-500/50 hover:text-teal-300 focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <a
                href={LINKEDIN_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-teal-400"
              >
                <ExternalLink size={11} />
                Connect on LinkedIn
              </a>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isLastAssistant = msg.role === "assistant" && i === messages.length - 1;
              return (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && isLastAssistant}
                />
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className="border-t border-zinc-800 p-3">
          {/* Persistent starter chips — always visible, scrollable on small screens */}
          <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {starters.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void appendAndSend(s)}
                disabled={isStreaming}
                aria-label={`Ask: ${s}`}
                className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-[11px] text-zinc-400 transition-colors outline-none hover:border-teal-500/50 hover:bg-teal-500/5 hover:text-teal-300 focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 transition-all focus-within:border-teal-500/60 focus-within:ring-1 focus-within:ring-teal-500/30">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              disabled={isStreaming}
              className="max-h-32 flex-1 resize-none bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800 disabled:opacity-50"
              style={{ lineHeight: "1.5" }}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isStreaming}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white transition-opacity outline-none hover:bg-teal-400 focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-800 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={13} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-zinc-600">
            AI may make mistakes · Always verify critical info
          </p>
        </div>
      </aside>
    </>
  );
}
