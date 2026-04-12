"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, X } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus quand le bar apparaît (controlled par le parent via max-h transition)
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative w-full"
      role="search"
    >
      <div className="relative flex items-center border-b border-border/60 transition-colors focus-within:border-foreground">
        <Search
          className="pointer-events-none ml-1 h-4 w-4 shrink-0 text-foreground/40"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          placeholder="Rechercher un produit, une catégorie…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-12 w-full min-w-0 bg-transparent px-4 font-mono text-[13px] text-foreground placeholder:font-mono placeholder:text-[12px] placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-foreground/40 focus:outline-none"
          aria-label="Rechercher"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Effacer la recherche"
            className="mr-2 inline-flex h-7 w-7 items-center justify-center text-foreground/40 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          disabled={!query.trim()}
          className="group/submit inline-flex h-10 items-center gap-2 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:text-foreground"
        >
          Entrée
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover/submit:translate-x-0.5"
            aria-hidden="true"
          />
        </button>
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/30">
        — Catalogue indexé · {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
      </p>
    </form>
  );
}
