"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";

import { SUGGESTED_PROMPTS } from "@/lib/assistant";

interface ChatMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
}

interface AssistantChatProps {
  /** City whose reading grounds the assistant's answers. */
  readonly cityId: string;
  readonly cityName: string;
}

const MAX_LENGTH = 500;

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi — I'm your air quality assistant. Ask about today's air, masks, purifiers, indoor air, exercising safely, or cutting your carbon footprint. My answers use the city you've selected.",
};

/** Conversational assistant grounded in the selected city's air quality reading. */
export function AssistantChat({ cityId, cityName }: AssistantChatProps) {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sequence = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const helperId = useId();

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, isSending]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_LENGTH);
      if (!text || isSending) return;

      sequence.current += 1;
      const userMessage: ChatMessage = {
        id: `user-${sequence.current}`,
        role: "user",
        content: text,
      };

      setMessages((previous) => [...previous, userMessage]);
      setInput("");
      setError(null);
      setIsSending(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, cityId }),
        });

        if (!response.ok) {
          throw new Error(`Assistant responded with ${response.status}`);
        }

        const data: unknown = await response.json();
        const reply =
          typeof data === "object" &&
          data !== null &&
          "reply" in data &&
          typeof (data as { reply: unknown }).reply === "string"
            ? (data as { reply: string }).reply
            : "Sorry — I didn't get a usable answer. Please try rephrasing.";

        sequence.current += 1;
        setMessages((previous) => [
          ...previous,
          { id: `assistant-${sequence.current}`, role: "assistant", content: reply },
        ]);
      } catch {
        setError(
          "Couldn't reach the assistant just now. Check your connection and try again.",
        );
      } finally {
        setIsSending(false);
      }
    },
    [cityId, isSending],
  );

  const canSend = input.trim().length > 0 && !isSending;

  return (
    <section
      aria-labelledby="assistant-heading"
      className="card-lg flex h-[560px] flex-col"
    >
      <header className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <Sparkles className="h-4 w-4 text-emerald-700" aria-hidden="true" />
        <div>
          <h2 id="assistant-heading" className="text-base font-bold text-slate-900">
            Air quality assistant
          </h2>
          <p className="text-xs text-slate-600">Grounded in the {cityName} reading</p>
        </div>
      </header>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-label="Conversation"
        aria-busy={isSending}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <p
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-900"
              }`}
            >
              <span className="sr-only">
                {message.role === "user" ? "You said: " : "Assistant said: "}
              </span>
              {message.content}
            </p>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <p className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2.5 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Thinking…
            </p>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="border-t border-slate-200 px-4 py-3">
          <p className="mb-2 text-xs font-semibold text-slate-700">Try asking</p>
          <ul className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => void send(prompt)}
                  className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-1"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <p role="alert" className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </p>
      )}

      <form
        className="border-t border-slate-200 p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Ask the air quality assistant a question
        </label>
        <p id={helperId} className="sr-only">
          Press Enter to send. Answers use the selected city.
        </p>
        <div className="flex gap-2">
          <input
            id={inputId}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={MAX_LENGTH}
            placeholder="Ask about air quality…"
            autoComplete="off"
            aria-describedby={helperId}
            disabled={isSending}
            className="input flex-1"
          />
          <button type="submit" disabled={!canSend} className="btn-primary px-4">
            <Send className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </section>
  );
}
