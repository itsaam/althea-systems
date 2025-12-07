"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Rechercher un produit..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-4 h-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-ring rounded-full"
      />
    </form>
  );
}
