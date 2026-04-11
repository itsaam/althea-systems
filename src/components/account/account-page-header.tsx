import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AccountPageHeaderProps {
  eyebrow: string;
  index?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  accent?: boolean;
  className?: string;
}

/**
 * Header éditorial unifié pour l'espace client.
 * Eyebrow mono · Titre display · Description · Actions à droite.
 */
export function AccountPageHeader({
  eyebrow,
  index,
  title,
  description,
  actions,
  accent = true,
  className,
}: AccountPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-border/60 pb-8",
        "md:flex-row md:items-end md:justify-between md:gap-10",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.22em] text-foreground/55">
          <span className="opacity-60">—</span>
          <span>{eyebrow}</span>
          {index && (
            <>
              <span className="text-foreground/20">/</span>
              <span className="tabular-nums">{index}</span>
            </>
          )}
        </div>
        <h1 className="mt-5 font-display text-[40px] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-[56px]">
          {title}
          {accent && (
            <span
              aria-hidden
              className="ml-2 inline-block h-2 w-2 translate-y-[-0.3em] rounded-full bg-electric-indigo-500 align-middle"
            />
          )}
        </h1>
        {description && (
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-foreground/65">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </header>
  );
}

export default AccountPageHeader;
