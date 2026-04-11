"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Send, Sparkles, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clearChatHistory,
  createMessageId,
  loadChatHistory,
  saveChatHistory,
  type ChatMessage,
} from "@/lib/chatbot-storage";
import { ChatbotMessage } from "./chatbot-message";

type ErrorKind = "network" | "unavailable" | "generic" | null;

export function ChatbotWidget() {
  const t = useTranslations("chatbot");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<ErrorKind>(null);
  const [mounted, setMounted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastUserMessagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    setMounted(true);
    setMessages(loadChatHistory());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveChatHistory(messages);
  }, [messages, mounted]);

  useEffect(() => {
    if (!open) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, open, isStreaming]);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const runChatRequest = useCallback(
    async (history: ChatMessage[]) => {
      setIsStreaming(true);
      setError(null);

      const assistantId = createMessageId();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          createdAt: Date.now(),
        },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: controller.signal,
        });

        if (res.status === 503) {
          setError("unavailable");
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          return;
        }

        if (!res.ok || !res.body) {
          setError("generic");
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
          );
        }

        if (accumulated.length === 0) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setError("generic");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          return;
        }
        setError("network");
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      const text = input.trim();
      if (!text || isStreaming) return;

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: text,
        createdAt: Date.now(),
      };
      const nextHistory = [...messages, userMessage];
      lastUserMessagesRef.current = nextHistory;
      setMessages(nextHistory);
      setInput("");
      await runChatRequest(nextHistory);
    },
    [input, isStreaming, messages, runChatRequest],
  );

  const handleRetry = useCallback(async () => {
    if (isStreaming || lastUserMessagesRef.current.length === 0) return;
    await runChatRequest(lastUserMessagesRef.current);
  }, [isStreaming, runChatRequest]);

  const handleClear = useCallback(() => {
    abortRef.current?.abort();
    clearChatHistory();
    setMessages([]);
    setError(null);
    lastUserMessagesRef.current = [];
  }, []);

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const errorMessage =
    error === "network"
      ? t("errorNetwork")
      : error === "unavailable"
        ? t("errorUnavailable")
        : error === "generic"
          ? t("errorGeneric")
          : null;

  const labels = { you: t("you"), assistant: t("assistant") };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("close") : t("open")}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 end-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 outline-none transition-transform duration-200 ease-out hover:scale-105 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none",
          open && "scale-95 opacity-0 pointer-events-none",
        )}
      >
        <span
          className="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping"
          aria-hidden="true"
        />
        <MessageCircle className="relative h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in-0 md:bg-transparent md:backdrop-blur-0"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden bg-background shadow-2xl transition-all duration-300 ease-out motion-reduce:transition-none",
          "inset-0 md:inset-auto md:bottom-5 md:end-5 md:h-[min(640px,calc(100vh-2.5rem))] md:w-[400px] md:rounded-2xl md:border",
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "pointer-events-none translate-y-6 opacity-0 md:translate-y-2",
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b bg-gradient-to-br from-primary to-[color-mix(in_oklab,var(--primary),#000_18%)] px-4 py-3.5 text-primary-foreground">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight">
                {t("title")}
              </p>
              <p className="truncate text-[11px] opacity-80">{t("subtitle")}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                aria-label={t("clear")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("close")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground/80 transition-colors hover:bg-white/15 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-muted/30 px-4 py-4"
        >
          {messages.length === 0 && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
                {t("greeting")}
              </div>
            </div>
          )}
          {messages.map((message) => (
            <ChatbotMessage
              key={message.id}
              message={message}
              labels={labels}
            />
          ))}
          {errorMessage && (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
            >
              <p>{errorMessage}</p>
              {error !== "unavailable" &&
                lastUserMessagesRef.current.length > 0 && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="self-start rounded-md border border-destructive/40 px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-destructive/10"
                  >
                    {t("retry")}
                  </button>
                )}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 border-t bg-background px-4 py-3"
        >
          <div className="flex items-end gap-2">
            <label htmlFor="chatbot-input" className="sr-only">
              {t("placeholder")}
            </label>
            <textarea
              id="chatbot-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder={t("placeholder")}
              rows={1}
              disabled={isStreaming}
              className="flex max-h-32 min-h-[40px] w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              aria-label={t("send")}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground">
            {t("disclaimer")}
          </p>
        </form>
      </aside>
    </>
  );
}
