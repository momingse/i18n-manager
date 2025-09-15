import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchFiles } from "@/lib/searchPattern";
import { cn } from "@/lib/utils";
import { ProjectFile } from "@/store/project";
import { ChevronDown, Clock, File, Folder, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface PathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  availableFolders: ProjectFile[];
  maxSuggestions?: number;
}

export const PathInput = ({
  value,
  onChange,
  placeholder = "Select a path...",
  availableFolders,
  maxSuggestions = 8,
}: PathInputProps) => {
  // local input state to allow debouncing and keyboard navigation
  const [query, setQuery] = useState(value ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // keep internal query in sync when parent value changes
  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  // debounced value so we don't spam search on every keystroke
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 160);
    return () => clearTimeout(t);
  }, [query]);

  // compute suggestions using external searchFiles util
  const filteredSuggestions = useMemo(() => {
    if (!debouncedQuery)
      return searchFiles(availableFolders, "").slice(0, maxSuggestions);
    return searchFiles(availableFolders, debouncedQuery).slice(
      0,
      maxSuggestions,
    );
  }, [debouncedQuery, availableFolders, maxSuggestions]);

  const selectSuggestion = useCallback((path: string) => {
    onChange(path);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  }, [onChange]);

  // close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!showSuggestions) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(filteredSuggestions.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(-1, i - 1));
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        setFocusedIndex(-1);
      }
      if (e.key === "Enter") {
        if (focusedIndex >= 0 && focusedIndex < filteredSuggestions.length) {
          const sel = filteredSuggestions[focusedIndex];
          if (sel) selectSuggestion(sel.path);
        } else if (query.trim()) {
          // if user typed a free path, let parent handle it
          onChange(query.trim());
          setShowSuggestions(false);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    showSuggestions,
    filteredSuggestions,
    focusedIndex,
    query,
    onChange,
    selectSuggestion,
  ]);

  useEffect(() => {
    // ensure the focused item is visible
    if (focusedIndex < 0 || !listRef.current) return;
    const node = listRef.current.querySelectorAll("[role=option]")[
      focusedIndex
    ] as HTMLElement | undefined;
    if (node) node.scrollIntoView({ block: "nearest" });
  }, [focusedIndex]);

  // helpers
  const formatBytes = (size?: number) => {
    if (size == null) return "";
    if (size < 1024) return `${size} B`;
    const ki = 1024;
    const mi = ki * 1024;
    const gi = mi * 1024;
    if (size < mi) return `${Math.round((size / ki) * 10) / 10} KB`;
    if (size < gi) return `${Math.round((size / mi) * 10) / 10} MB`;
    return `${Math.round((size / gi) * 10) / 10} GB`;
  };

  const formatDate = (d?: Date) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleString();
    } catch {
      return "";
    }
  };

  const clearInput = () => {
    setQuery("");
    onChange("");
    setShowSuggestions(true);
  };

  return (
    <div ref={wrapperRef} className="relative mt-2" aria-haspopup="listbox">
      <div className="relative">
        <Input
          id="i18n-path"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="h-11 bg-muted/50 border-0 focus:bg-muted/70 transition-colors duration-200 pr-10 text-sm"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="path-suggestion-list"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearInput}
              className="h-7 w-7 p-0 hover:bg-muted/70"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions((s) => !s)}
            className={"h-7 w-7 p-0 hover:bg-muted/70"}
            aria-label="Toggle suggestions"
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                showSuggestions && "rotate-180",
              )}
            />
          </Button>
        </div>
      </div>

      {filteredSuggestions.length !== 0 && showSuggestions && (
        <div
          id="path-suggestion-list"
          ref={listRef}
          role="listbox"
          aria-label="Path suggestions"
          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-44 overflow-y-auto"
        >
          {filteredSuggestions.map((f, idx) => (
            <button
              key={f.path}
              role="option"
              aria-selected={focusedIndex === idx}
              type="button"
              onMouseEnter={() => setFocusedIndex(idx)}
              onMouseLeave={() => setFocusedIndex(-1)}
              onClick={() => selectSuggestion(f.path)}
              className={cn(
                "w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors duration-150 text-sm flex items-start gap-3 border-b border-border/50 last:border-b-0",
                focusedIndex === idx && "bg-muted/50",
              )}
            >
              <div className="mt-0.5">
                {f.isDirectory ? (
                  <Folder className="w-4 h-4" />
                ) : (
                  <File className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{f.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {f.path}
                </div>
              </div>

              <div className="flex items-center gap-3 ml-2 text-xs text-muted-foreground">
                {f.modified && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(f.modified)}</span>
                  </div>
                )}
                {f.size != null && (
                  <div className="text-xs">{formatBytes(f.size)}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
