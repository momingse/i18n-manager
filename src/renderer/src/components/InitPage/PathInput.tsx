import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

interface PathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function PathInput({ value, onChange, placeholder }: PathInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const commonPaths = [
      "./locales",
      "./src/locales",
      "./src/i18n",
      "./public/locales",
      "./public/i18n",
      "./assets/locales",
      "./assets/i18n",
      "./lang",
      "./languages",
      "./translations",
      "./src/translations",
      "./public/translations",
    ];
    
    if (!value) return commonPaths.slice(0, 6);

    const query = value.toLowerCase();
    return commonPaths
      .filter((path) => path.toLowerCase().includes(query))
      .sort((a, b) => {
        const aIndex = a.toLowerCase().indexOf(query);
        const bIndex = b.toLowerCase().indexOf(query);
        if (aIndex !== bIndex) return aIndex - bIndex;
        return a.length - b.length;
      })
      .slice(0, 6);
  }, [value]);

  const selectSuggestion = (path: string) => {
    onChange(path);
    setShowSuggestions(false);
  };

  return (
    <div className="relative mt-2">
      <Input
        id="i18n-path"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        className="h-11 bg-muted/50 border-0 focus:bg-muted/70 transition-colors duration-200 pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted/70"
      >
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            showSuggestions && "rotate-180",
          )}
        />
      </Button>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
          {filteredSuggestions.map((path) => (
            <button
              key={path}
              type="button"
              onClick={() => selectSuggestion(path)}
              className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors duration-150 text-sm border-b border-border/50 last:border-b-0"
            >
              {path}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
