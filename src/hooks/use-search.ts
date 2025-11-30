"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (newQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(newQuery)}`);
      }
    },
    [router]
  );

  return {
    query,
    debouncedQuery,
    setQuery,
    search,
  };
}
