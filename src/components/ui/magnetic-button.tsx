"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";

type Props = {
  children: ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  strength?: number;
  ariaLabel?: string;
};

const SPRING = { stiffness: 180, damping: 18, mass: 0.6 };

export default function MagneticButton({
  children,
  href,
  className,
  onClick,
  strength = 0.35,
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const xRaw = useMotionValue(0);
  const yRaw = useMotionValue(0);

  const x = useSpring(xRaw, SPRING);
  const y = useSpring(yRaw, SPRING);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = event.clientX - rect.left - rect.width / 2;
    const relY = event.clientY - rect.top - rect.height / 2;
    xRaw.set(relX * strength);
    yRaw.set(relY * strength);
  };

  const handleLeave = () => {
    xRaw.set(0);
    yRaw.set(0);
  };

  const inner = (
    <motion.span style={{ x, y }} className="inline-flex items-center">
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="inline-flex"
      >
        <Link href={href} className={className} aria-label={ariaLabel}>
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="inline-flex"
    >
      <button
        type="button"
        onClick={onClick}
        className={className}
        aria-label={ariaLabel}
      >
        {inner}
      </button>
    </motion.div>
  );
}
