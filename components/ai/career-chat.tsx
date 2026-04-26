"use client";

import { useEffect, useRef } from "react";
import { Bot, User, Send, X, Sparkles, ExternalLink } from "lucide-react";
import { useCareerChat } from "@/hooks/use-career-chat";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface CareerChatProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Suggested Starters ────────────────────────────────────────────────────────

const STARTERS = [
  "What are Javier's soft skills?",
  "Tell me about his role at Adevinta.",
  "What tech stack does he use?",
  "How does his music career influence his code?",
];

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
        {isUser ? <User size={14} /> : <Bot size={14} className="text-teal-400" />}
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
  const { messages, input, setInput, isStreaming, sendMessage, appendAndSend, reset } =
    useCareerChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
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
            <p className="truncate text-xs text-zinc-500">Career · Projects · Tech Stack</p>
          </div>
          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                title="Clear chat"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
              aria-label="Close chat"
            >
              <X size={16} />
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
                <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
                  Ask me anything about his career, projects, tech stack, or engineering philosophy.
                </p>
              </div>

              {/* Starter chips */}
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void appendAndSend(s)}
                    disabled={isStreaming}
                    className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-teal-500/50 hover:text-teal-300 disabled:opacity-40"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <a
                href="https://www.linkedin.com/in/javier-álvarez-07783a111"
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
            {STARTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void appendAndSend(s)}
                disabled={isStreaming}
                className="shrink-0 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1 text-[11px] text-zinc-400 transition-colors hover:border-teal-500/50 hover:bg-teal-500/5 hover:text-teal-300 disabled:opacity-40"
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
              placeholder="Ask about Javier's career…"
              disabled={isStreaming}
              className="max-h-32 flex-1 resize-none bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none disabled:opacity-50"
              style={{ lineHeight: "1.5" }}
            />
            <button
              type="button"
              onClick={() => void sendMessage()}
              disabled={!input.trim() || isStreaming}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white transition-opacity hover:bg-teal-400 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={13} />
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
