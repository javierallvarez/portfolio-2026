"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface UseCareerChatReturn {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  isStreaming: boolean;
  sendMessage: () => Promise<void>;
  appendAndSend: (text: string) => Promise<void>;
  reset: () => void;
}

let msgIdCounter = 0;
function newId() {
  return `msg-${++msgIdCounter}-${Date.now()}`;
}

export function useCareerChat(): UseCareerChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  // Stable ref so dispatchText can read current messages without being a dep
  const messagesRef = useRef<ChatMessage[]>(messages);
  messagesRef.current = messages;

  const dispatchText = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: ChatMessage = { id: newId(), role: "user", content: text };
      const assistantId = newId();
      const assistantMsg: ChatMessage = { id: assistantId, role: "assistant", content: "" };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const history = [...messagesRef.current, userMsg].map(({ role, content }) => ({
        role,
        content,
      }));

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
          );
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content:
                      "Sorry, something went wrong. Please try again or contact Javier on LinkedIn.",
                  }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming],
  );

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    setInput("");
    await dispatchText(text);
  }, [input, dispatchText]);

  const appendAndSend = useCallback(
    async (text: string) => {
      await dispatchText(text);
    },
    [dispatchText],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setIsStreaming(false);
  }, []);

  return { messages, input, setInput, isStreaming, sendMessage, appendAndSend, reset };
}
