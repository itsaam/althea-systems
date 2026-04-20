import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  eyebrow: string;
  index?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  accent?: boolean;
  className?: string;
}

/**
 * Header éditorial unifié pour les pages admin.
 * Eyebrow mono · Titre display · Description · Actions à droite.
 */
export function AdminPageHeader({
  eyebrow,
  index,
  title,
  description,
  actions,
  accent = true,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-6 border-b border-border/60 pb-8",
        "md:flex-row md:items-end md:justify-between md:gap-10",
        className
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
          <span className="opacity-60">—</span>
          <span>{eyebrow}</span>
          {index && (
            <>
              <span className="text-foreground/20">/</span>
              <span className="tabular-nums">{index}</span>
            </>
          )}
        </div>
        <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground md:text-[44px]">
          {title}
          {accent && (
            <span
              aria-hidden
              className="ml-1 inline-block h-1.5 w-1.5 translate-y-[-0.25em] rounded-full bg-primary align-middle"
            />
          )}
        </h1>
        {description && (
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-foreground/60">
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

export default AdminPageHeader;
