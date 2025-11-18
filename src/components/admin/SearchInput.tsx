"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useEffect, useState } from "react";

interface SearchInputProps {
  placeholder?: string;
  basePath: string;
}

export function SearchInput({ placeholder = "Search...", basePath }: Readonly<SearchInputProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      
      if (searchValue) {
        params.set("search", searchValue);
        params.set("page", "1"); // Reset to first page on search
      } else {
        params.delete("search");
      }

      startTransition(() => {
        router.push(`${basePath}?${params.toString()}`);
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, basePath, router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
