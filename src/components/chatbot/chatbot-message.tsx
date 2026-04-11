"use client";

import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chatbot-storage";

type Token =
  | { type: "text"; value: string }
  | { type: "bold"; value: ReactNode[] }
  | { type: "italic"; value: ReactNode[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; label: string };

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const CODE_RE = /`([^`\n]+)`/g;
const BOLD_RE = /\*\*([^*\n]+)\*\*/g;
const ITALIC_RE = /\*([^*\n]+)\*/g;

function renderInline(source: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  const patterns: Array<{
    re: RegExp;
    build: (m: RegExpExecArray, k: string) => ReactNode;
  }> = [
    {
      re: LINK_RE,
      build: (m, k) => (
        <a
          key={k}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary"
        >
          {m[1]}
        </a>
      ),
    },
    {
      re: CODE_RE,
      build: (m, k) => (
        <code
          key={k}
          className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
        >
          {m[1]}
        </code>
      ),
    },
    {
      re: BOLD_RE,
      build: (m, k) => (
        <strong key={k} className="font-semibold">
          {m[1]}
        </strong>
      ),
    },
    {
      re: ITALIC_RE,
      build: (m, k) => (
        <em key={k} className="italic">
          {m[1]}
        </em>
      ),
    },
  ];

  while (lastIndex < source.length) {
    let earliest: {
      match: RegExpExecArray;
      build: (m: RegExpExecArray, k: string) => ReactNode;
    } | null = null;
    for (const { re, build } of patterns) {
      re.lastIndex = lastIndex;
      match = re.exec(source);
      if (match && (!earliest || match.index < earliest.match.index)) {
        earliest = { match, build };
      }
    }
    if (!earliest) {
      nodes.push(source.slice(lastIndex));
      break;
    }
    if (earliest.match.index > lastIndex) {
      nodes.push(source.slice(lastIndex, earliest.match.index));
    }
    nodes.push(earliest.build(earliest.match, `${keyPrefix}-${idx++}`));
    lastIndex = earliest.match.index + earliest.match[0].length;
  }

  return nodes;
}

function renderBlocks(content: string): ReactNode[] {
  const paragraphs = content.split(/\n\n+/);
  return paragraphs.map((para, pIdx) => {
    const lines = para.split("\n");
    return (
      <p key={`p-${pIdx}`} className="whitespace-pre-wrap">
        {lines.map((line, lIdx) => (
          <span key={`l-${pIdx}-${lIdx}`}>
            {renderInline(line, `p${pIdx}l${lIdx}`)}
            {lIdx < lines.length - 1 ? <br /> : null}
          </span>
        ))}
      </p>
    );
  });
}

type Props = {
  message: ChatMessage;
  labels: { you: string; assistant: string };
};

function ChatbotMessageComponent({ message, labels }: Props) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground",
        )}
      >
        <p className="sr-only">{isUser ? labels.you : labels.assistant}</p>
        <div className="space-y-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {message.content.length === 0 ? (
            <span
              className="inline-flex h-4 items-center gap-1"
              aria-hidden="true"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60" />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60"
                style={{ animationDelay: "300ms" }}
              />
            </span>
          ) : (
            renderBlocks(message.content)
          )}
        </div>
      </div>
    </div>
  );
}

export const ChatbotMessage = memo(ChatbotMessageComponent);
ChatbotMessage.displayName = "ChatbotMessage";
