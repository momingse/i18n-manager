import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMMON_LANGUAGES } from "@/constants/constants";
import { useState } from "react";
import { i18nLanguage } from "@/store/project";

interface LanguageManagerProps {
  detectedLanguages: i18nLanguage[];
  setDetectedLanguages: React.Dispatch<React.SetStateAction<i18nLanguage[]>>;
}

export function LanguageManager({
  detectedLanguages,
  setDetectedLanguages,
}: LanguageManagerProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<
    (typeof COMMON_LANGUAGES)[0] | null
  >(null);

  const addLanguage = () => {
    if (!selectedLanguage) return;

    const newLang = {
      id: crypto.randomUUID(),
      filename: selectedLanguage.code,
      language: selectedLanguage.name,
    };

    setDetectedLanguages([...detectedLanguages, newLang]);
    setSelectedLanguage(null);
    setShowLanguageDropdown(false);
  };

  const removeLanguage = (id: string) => {
    setDetectedLanguages(detectedLanguages.filter((lang) => lang.id !== id));
  };

  const updateLanguage = (
    id: string,
    field: "filename" | "language",
    value: string,
  ) => {
    setDetectedLanguages(
      detectedLanguages.map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang,
      ),
    );
  };

  const availableLanguages = COMMON_LANGUAGES.filter(
    (lang) => !detectedLanguages.some((detected) => detected.filename === lang.code),
  );

  return (
    <>
      {/* Language List */}
      {detectedLanguages.length > 0 && (
        <div className="space-y-2 overflow-y-auto border border-border/50 rounded-lg p-2 bg-muted/20">
          {detectedLanguages.map((lang) => (
            <div
              key={lang.id}
              className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/30 shadow-sm"
            >
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Filename
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      value={lang.filename}
                      onChange={(e) =>
                        updateLanguage(lang.id, "filename", e.target.value)
                      }
                      className="h-8 text-sm bg-background/80 border-border/50"
                      placeholder="en"
                    />
                    <span className="text-xs text-muted-foreground">.json</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Language
                  </Label>
                  <Input
                    value={lang.language}
                    onChange={(e) =>
                      updateLanguage(lang.id, "language", e.target.value)
                    }
                    className="h-8 text-sm bg-background/80 border-border/50"
                    placeholder="English"
                    readOnly
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLanguage(lang.id)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Language Section */}
      <div className="border border-dashed border-border/50 rounded-lg p-4 bg-muted/10">
        <Label className="text-sm font-medium mb-3 block">Add New Language</Label>
        <div className="space-y-3">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="w-full h-10 justify-between text-sm bg-background/80 hover:bg-muted/70 border-border/50"
            >
              {selectedLanguage ? (
                <span className="flex items-center gap-2">
                  <span className="text-base">{selectedLanguage.flag}</span>
                  <span>{selectedLanguage.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({selectedLanguage.code}.json)
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">Choose a language...</span>
              )}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  showLanguageDropdown && "rotate-180",
                )}
              />
            </Button>

            {showLanguageDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-56 overflow-y-auto">
                {availableLanguages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => {
                      setSelectedLanguage(language);
                      setShowLanguageDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors duration-150 text-sm border-b border-border/30 last:border-b-0 flex items-center gap-3"
                  >
                    <span className="text-base">{language.flag}</span>
                    <div className="flex-1">
                      <span className="font-medium">{language.name}</span>
                    </div>
                    <span className="text-muted-foreground text-xs bg-muted/50 px-2 py-1 rounded">
                      {language.code}.json
                    </span>
                  </button>
                ))}
                {availableLanguages.length === 0 && (
                  <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                    All languages have been added
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={addLanguage}
            disabled={!selectedLanguage}
            size="sm"
            className="w-full h-9 bg-primary/90 hover:bg-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {selectedLanguage?.name || "Language"}
          </Button>
        </div>
      </div>
    </>
  );
}
