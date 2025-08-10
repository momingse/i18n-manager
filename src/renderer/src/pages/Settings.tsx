import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Settings, Globe, Zap, Menu } from "lucide-react";
import { toast } from "sonner";
import { useSidebarStore } from "@/store/sidebar";

const COMMON_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "no", name: "Norwegian", flag: "🇳🇴" },
];

export default function SettingsPage() {
  const [languages, setLanguages] = useState<string[]>(["en"]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [translationService, setTranslationService] = useState("gemini");
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { toggle } = useSidebarStore();

  useEffect(() => {
    const saved = localStorage.getItem("languages");
    if (saved) {
      setLanguages(JSON.parse(saved));
    }

    const savedService = localStorage.getItem("translationService");
    if (savedService) {
      setTranslationService(savedService);
    }

    const savedApiKey = localStorage.getItem("apiKey");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    localStorage.setItem("languages", JSON.stringify(languages));
    localStorage.setItem("translationService", translationService);
    localStorage.setItem("apiKey", apiKey);

    setIsSaving(false);
    toast("Setting saved", {
      description: "Language and service settings have been updated",
    });
  };

  const addLanguage = (code: string) => {
    if (!languages.includes(code)) {
      setLanguages((prev) => [...prev, code]);
      setSelectedLanguage("");
    }
  };

  const removeLanguage = (code: string) => {
    if (code !== "en") {
      setLanguages((prev) => prev.filter((lang) => lang !== code));
    }
  };

  const getLanguageInfo = (code: string) => {
    const lang = COMMON_LANGUAGES.find((l) => l.code === code);
    return lang || { code, name: code.toUpperCase(), flag: "🌐" };
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-600 sm:hidden">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure languages and translation services
          </p>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Button variant="outline" onClick={toggle}>
                <Menu className="w-6 h-6" />
              </Button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Upload Content</h1>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                Translation Service
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Configure your preferred translation service and API credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label
                    htmlFor="service"
                    className="text-sm sm:text-base font-medium"
                  >
                    Translation Service
                  </Label>
                  <Select
                    value={translationService}
                    onValueChange={setTranslationService}
                  >
                    <SelectTrigger className="mt-2 bg-muted/50 border-0 focus:bg-muted/70 transition-colors duration-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-blue-500" />
                          Google Gemini
                        </div>
                      </SelectItem>
                      <SelectItem value="ollama">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-green-500" />
                          Ollama (Local)
                        </div>
                      </SelectItem>
                      <SelectItem value="openai">OpenAI GPT</SelectItem>
                      <SelectItem value="anthropic">
                        Anthropic Claude
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="api-key"
                    className="text-sm sm:text-base font-medium"
                  >
                    API Key
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="mt-2 bg-muted/50 border-0 focus:bg-muted/70 transition-colors duration-200"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {translationService === "ollama"
                      ? "No API key required for local Ollama installation"
                      : "Required for external translation services"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl animate-in fade-in slide-in-from-bottom duration-700 delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                Supported Languages
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Manage the languages you want to support in your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap gap-3">
                {languages.map((lang, index) => {
                  const langInfo = getLanguageInfo(lang);
                  return (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-muted to-muted/50 hover:from-muted/80 hover:to-muted/30 transition-all duration-200 animate-in fade-in slide-in-from-left"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <span className="text-lg">{langInfo.flag}</span>
                      <span className="font-medium">{langInfo.name}</span>
                      <span className="text-muted-foreground">({lang})</span>
                      {lang !== "en" && (
                        <button
                          onClick={() => removeLanguage(lang)}
                          className="ml-1 hover:text-destructive transition-colors duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  );
                })}
              </div>

              <div className="border-t border-border/50 pt-6">
                <Label className="text-sm sm:text-base font-medium">
                  Add Language
                </Label>
                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-full sm:flex-1 bg-muted/50 border-0 focus:bg-muted/70 transition-colors duration-200">
                      <SelectValue placeholder="Select a language..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LANGUAGES.filter(
                        (lang) => !languages.includes(lang.code),
                      ).map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                            <span className="text-muted-foreground">
                              ({lang.code})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() =>
                      selectedLanguage && addLanguage(selectedLanguage)
                    }
                    disabled={!selectedLanguage}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Language
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end animate-in fade-in slide-in-from-bottom duration-700 delay-600">
            <Button
              onClick={saveSettings}
              size="md"
              sm:size="lg"
              className="px-6 sm:px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving Configuration...
                </div>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
