"use client";

import { motion } from "framer-motion";
import { createElement, type ReactElement } from "react";

type Tag = "h1" | "h2" | "h3" | "p" | "span" | "div";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: Tag;
  immediate?: boolean;
};

export default function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.03,
  as = "h1",
  immediate = false,
}: Props): ReactElement {
  const words = text.split(" ");

  return createElement(
    as,
    { className },
    words.map((word, wordIndex) => {
      const prevChars = words
        .slice(0, wordIndex)
        .reduce((acc, w) => acc + w.length, 0);

      return (
        <span
          key={`${word}-${wordIndex}`}
          style={{
            display: "inline-block",
            overflow: "hidden",
            whiteSpace: "nowrap",
            verticalAlign: "top",
          }}
        >
          {word.split("").map((char, charIndex) => {
            const i = prevChars + charIndex;
            const anim = immediate
              ? { animate: { opacity: 1, y: "0%" } }
              : {
                  whileInView: { opacity: 1, y: "0%" },
                  viewport: { once: true, margin: "-80px" } as const,
                };
            return (
              <motion.span
                key={`${char}-${charIndex}`}
                style={{ display: "inline-block", willChange: "transform" }}
                initial={{ opacity: 0, y: "110%" }}
                {...anim}
                transition={{
                  duration: 0.9,
                  delay: delay + i * stagger,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {char}
              </motion.span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <span style={{ display: "inline-block", width: "0.25em" }}>&nbsp;</span>
          )}
        </span>
      );
    })
  );
}
