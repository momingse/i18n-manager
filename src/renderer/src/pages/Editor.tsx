import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Download,
  Edit3,
  FileJson,
  FileSpreadsheet,
  Filter,
  Menu,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Translation {
  id: string;
  key: string;
  [language: string]: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function EditorPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<string[]>([
    "en",
    "es",
    "fr",
    "de",
  ]);
  const [newKey, setNewKey] = useState("");
  const [selectedService, setSelectedService] = useState("gemini");
  const [isSaving, setIsSaving] = useState(false);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [showExportPanel, setShowExportPanel] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState("json");
  const [exportStructure, setExportStructure] = useState("by-language");
  const [isExporting, setIsExporting] = useState(false);

  const { toggle } = useSidebarStore();

  // Filter and paginate translations
  const filteredTranslations = useMemo(() => {
    if (!searchTerm) return translations;
    return translations.filter(
      (translation) =>
        translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        languages.some((lang) =>
          translation[lang]?.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );
  }, [translations, searchTerm, languages]);

  const totalPages = Math.ceil(filteredTranslations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTranslations = filteredTranslations.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  useEffect(() => {
    const saved = localStorage.getItem("translations");
    if (saved) {
      setTranslations(JSON.parse(saved));
    } else {
      // Generate sample data for demo
      const sampleData: Translation[] = [
        {
          id: "1",
          key: "welcome_message",
          en: "Welcome to our application",
          es: "Bienvenido a nuestra aplicación",
          fr: "Bienvenue dans notre application",
          de: "Willkommen in unserer Anwendung",
        },
        {
          id: "2",
          key: "login_button",
          en: "Login",
          es: "Iniciar sesión",
          fr: "Se connecter",
          de: "Anmelden",
        },
        {
          id: "3",
          key: "thank_you",
          en: "Thank you",
          es: "Gracias",
          fr: "Merci",
          de: "Danke",
        },
        {
          id: "4",
          key: "settings",
          en: "Settings",
          es: "Configuración",
          fr: "Paramètres",
          de: "Einstellungen",
        },
        {
          id: "5",
          key: "logout",
          en: "Logout",
          es: "Cerrar sesión",
          fr: "Se déconnecter",
          de: "Abmelden",
        },
        // Add more sample entries
        ...Array.from({ length: 45 }, (_, i) => ({
          id: (6 + i).toString(),
          key: `sample_key_${i + 1}`,
          en: `Sample text ${i + 1}`,
          es: `Texto de muestra ${i + 1}`,
          fr: `Texte d'exemple ${i + 1}`,
          de: `Beispieltext ${i + 1}`,
        })),
      ];
      setTranslations(sampleData);
    }

    const savedLanguages = localStorage.getItem("languages");
    if (savedLanguages) {
      const langs = JSON.parse(savedLanguages);
      setLanguages(langs);
      setSelectedLanguages(langs);
    }
  }, []);

  const saveTranslations = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    localStorage.setItem("translations", JSON.stringify(translations));
    setIsSaving(false);
    toast("Saved", { description: "Changes saved successfully" });
  };

  const addNewTranslation = () => {
    if (!newKey.trim()) return;

    const newTranslation: Translation = {
      id: Date.now().toString(),
      key: newKey,
      ...languages.reduce((acc, lang) => ({ ...acc, [lang]: "" }), {}),
    };

    setTranslations((prev) => [newTranslation, ...prev]);
    setNewKey("");
    setCurrentPage(1);
  };

  const updateTranslation = (id: string, field: string, value: string) => {
    setTranslations((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const deleteTranslation = (id: string) => {
    setTranslations((prev) => prev.filter((t) => t.id !== id));
    const newTotal = Math.ceil(
      (filteredTranslations.length - 1) / itemsPerPage,
    );
    if (currentPage > newTotal && newTotal > 0) {
      setCurrentPage(newTotal);
    }
  };

  const duplicateTranslation = (id: string) => {
    const original = translations.find((t) => t.id === id);
    if (original) {
      const duplicate: Translation = {
        ...original,
        id: Date.now().toString(),
        key: `${original.key}_copy`,
      };
      setTranslations((prev) => [duplicate, ...prev]);
      setCurrentPage(1);
    }
  };

  const generateTranslation = async (
    key: string,
    sourceText: string,
    targetLang: string,
  ) => {
    const generatingKey = `${key}-${targetLang}`;
    setGeneratingFor(generatingKey);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockTranslations: Record<string, Record<string, string>> = {
        es: {
          Hello: "Hola",
          Welcome: "Bienvenido",
          Login: "Iniciar sesión",
          "Welcome to our application": "Bienvenido a nuestra aplicación",
          "Thank you": "Gracias",
        },
        fr: {
          Hello: "Bonjour",
          Welcome: "Bienvenue",
          Login: "Se connecter",
          "Welcome to our application": "Bienvenue dans notre application",
          "Thank you": "Merci",
        },
        de: {
          Hello: "Hallo",
          Welcome: "Willkommen",
          Login: "Anmelden",
          "Welcome to our application": "Willkommen in unserer Anwendung",
          "Thank you": "Danke",
        },
      };

      const translation =
        mockTranslations[targetLang]?.[sourceText] ||
        `[${targetLang}] ${sourceText}`;
      updateTranslation(key, targetLang, translation);

      toast("Generated", {
        description: `${targetLang.toUpperCase()} translation ready`,
      });
    } catch (error) {
      toast.error("Failed", {
        description: "Please try again",
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language)
        ? prev.filter((l) => l !== language)
        : [...prev, language],
    );
  };

  const selectAllLanguages = () => {
    setSelectedLanguages(languages);
  };

  const deselectAllLanguages = () => {
    setSelectedLanguages([]);
  };

  const generateExportData = () => {
    if (exportStructure === "by-language") {
      const data: Record<string, Record<string, string>> = {};
      selectedLanguages.forEach((lang) => {
        data[lang] = {};
        translations.forEach((translation) => {
          if (translation[lang]) {
            data[lang][translation.key] = translation[lang];
          }
        });
      });
      return data;
    } else {
      const data: Record<string, Record<string, string>> = {};
      translations.forEach((translation) => {
        data[translation.key] = {};
        selectedLanguages.forEach((lang) => {
          if (translation[lang]) {
            data[translation.key][lang] = translation[lang];
          }
        });
      });
      return data;
    }
  };

  const downloadFile = (
    filename: string,
    content: string,
    mimeType: string,
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: Record<string, string>) => {
    const rows = [["Key", "Translation"]];
    Object.entries(data).forEach(([key, value]) => {
      rows.push([key, value]);
    });
    return rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  };

  const convertObjectToCSV = (data: Record<string, Record<string, string>>) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return "";

    const languages = selectedLanguages;
    const rows = [["Key", ...languages]];

    keys.forEach((key) => {
      const row = [key];
      languages.forEach((lang) => {
        row.push(data[key][lang] || "");
      });
      rows.push(row);
    });

    return rows
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  };

  const exportTranslations = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const data = generateExportData();

    if (exportStructure === "by-language") {
      selectedLanguages.forEach((lang) => {
        const content =
          exportFormat === "json"
            ? JSON.stringify(data[lang], null, 2)
            : convertToCSV(data[lang]);
        const filename = `translations-${lang}.${exportFormat}`;
        const mimeType =
          exportFormat === "json" ? "application/json" : "text/csv";
        downloadFile(filename, content, mimeType);
      });

      toast("Exported", {
        description: `${selectedLanguages.length} files downloaded`,
      });
    } else {
      const content =
        exportFormat === "json"
          ? JSON.stringify(data, null, 2)
          : convertObjectToCSV(data);
      const filename = `translations-all.${exportFormat}`;
      const mimeType =
        exportFormat === "json" ? "application/json" : "text/csv";
      downloadFile(filename, content, mimeType);

      toast("Exported", {
        description: `translations.${exportFormat} downloaded`,
      });
    }

    setIsExporting(false);
    setShowExportPanel(false);
  };

  const handleCellClick = (id: string, field: string) => {
    setEditingCell({ id, field });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string, field: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setEditingCell(null);
    }
    if (e.key === "Tab") {
      e.preventDefault();
      setEditingCell(null);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-6 py-6 max-w-full">
        {/* Clean Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="lg:hidden">
                <Button variant="outline" onClick={toggle}>
                  <Menu className="w-6 h-6" />
                </Button>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Translation Editor</h1>
                <p className="text-sm text-muted-foreground">
                  {filteredTranslations.length} entries
                  {searchTerm && ` (filtered from ${translations.length})`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={saveTranslations}
                disabled={isSaving}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export
              </Button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4 p-4 bg-card/30 backdrop-blur-sm rounded-xl border border-border/30">
            {/* Primary Actions */}
            <div className="flex flex-1 gap-3 md:flex-row flex-col">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-0 focus:bg-background/70"
                />
              </div>

              <div className="flex gap-2 flex-col sm:flex-row">
                <Input
                  placeholder="Add new key..."
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addNewTranslation()}
                  className="w-48 bg-background/50 border-0 focus:bg-background/70 flex-1"
                />
                <Button
                  onClick={addNewTranslation}
                  disabled={!newKey.trim()}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <Select
                  value={selectedService}
                  onValueChange={setSelectedService}
                >
                  <SelectTrigger className="w-28 h-8 bg-background/50 border-0 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="ollama">Ollama</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => setItemsPerPage(Number(value))}
                >
                  <SelectTrigger className="w-16 h-8 bg-background/50 border-0 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option.toString()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs">per page</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Simplified Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-card/20 backdrop-blur-sm rounded-lg border border-border/20">
              <div className="text-sm text-muted-foreground">
                {startIndex + 1}–
                {Math.min(endIndex, filteredTranslations.length)} of{" "}
                {filteredTranslations.length}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="h-8 w-8 p-0 text-xs"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Clean Table */}
          <Card className="border-0 bg-card/30 backdrop-blur-sm shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-b border-border/50 hover:bg-muted/40">
                    <TableHead className="w-12 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      #
                    </TableHead>
                    <TableHead className="w-20 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                    <TableHead className="w-48 font-semibold text-xs uppercase tracking-wider text-muted-foreground left-0 bg-muted z-10">
                      Key
                    </TableHead>
                    {languages.map((lang, index) => (
                      <TableHead
                        key={lang}
                        className="min-w-64 font-semibold text-xs uppercase tracking-wider"
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-white font-medium shadow-sm px-2 py-1",
                              index === 0 && "bg-blue-500",
                              index === 1 && "bg-green-500",
                              index === 2 && "bg-purple-500",
                              index === 3 && "bg-orange-500",
                              index > 3 && "bg-gray-500",
                            )}
                          >
                            {lang.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-2">
                            {
                              currentTranslations.filter((t) => t[lang]?.trim())
                                .length
                            }
                            /{currentTranslations.length}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTranslations.map((translation, index) => {
                    const globalIndex = startIndex + index;
                    return (
                      <TableRow
                        key={translation.id}
                        className={cn(
                          "border-b border-border/20 hover:bg-muted/20 transition-all duration-200 group",
                          globalIndex % 2 === 0
                            ? "bg-background/40"
                            : "bg-muted/10",
                        )}
                      >
                        <TableCell className="text-center text-xs text-muted-foreground font-mono bg-muted/10">
                          {globalIndex + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all duration-200"
                              title="Edit"
                            >
                              <Wand2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                duplicateTranslation(translation.id)
                              }
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all duration-200"
                              title="Duplicate"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTranslation(translation.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-all duration-200"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "font-medium left-0 z-10",
                            globalIndex % 2 === 0 ? "bg-background/40" : "bg-muted/5",
                          )}
                        >
                          <div className="relative">
                            {editingCell?.id === translation.id &&
                            editingCell?.field === "key" ? (
                              <Input
                                value={translation.key}
                                onChange={(e) =>
                                  updateTranslation(
                                    translation.id,
                                    "key",
                                    e.target.value,
                                  )
                                }
                                onBlur={handleCellBlur}
                                onKeyDown={(e) =>
                                  handleKeyDown(e, translation.id, "key")
                                }
                                className="font-mono text-sm bg-inherit border-2 border-primary/50 focus:border-primary"
                                autoFocus
                              />
                            ) : (
                              <div
                                onClick={() =>
                                  handleCellClick(translation.id, "key")
                                }
                                className="font-mono text-sm p-2 rounded cursor-text hover:bg-muted/20 transition-colors duration-200 min-h-[2.5rem] flex items-center"
                              >
                                {translation.key || (
                                  <span className="text-muted-foreground italic">
                                    Click to edit
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        {languages.map((lang) => (
                          <TableCell key={lang} className="relative">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 relative">
                                {editingCell?.id === translation.id &&
                                editingCell?.field === lang ? (
                                  <Textarea
                                    value={translation[lang] || ""}
                                    onChange={(e) =>
                                      updateTranslation(
                                        translation.id,
                                        lang,
                                        e.target.value,
                                      )
                                    }
                                    onBlur={handleCellBlur}
                                    onKeyDown={(e) =>
                                      handleKeyDown(e, translation.id, lang)
                                    }
                                    placeholder={`${lang} translation...`}
                                    rows={2}
                                    className="resize-none bg-white border-2 border-primary/50 focus:border-primary text-sm"
                                    autoFocus
                                  />
                                ) : (
                                  <div
                                    onClick={() =>
                                      handleCellClick(translation.id, lang)
                                    }
                                    className={cn(
                                      "p-2 rounded cursor-text hover:bg-muted/20 transition-colors duration-200 min-h-[2.5rem] flex items-center text-sm",
                                      !translation[lang] &&
                                        "text-muted-foreground italic",
                                    )}
                                  >
                                    {translation[lang] ||
                                      `Add ${lang} translation`}
                                  </div>
                                )}
                              </div>
                              {translation.en && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    generateTranslation(
                                      translation.id,
                                      translation.en,
                                      lang,
                                    )
                                  }
                                  disabled={
                                    generatingFor ===
                                    `${translation.id}-${lang}`
                                  }
                                  className={cn(
                                    "shrink-0 h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary transition-all duration-200 opacity-0 group-hover:opacity-100",
                                    generatingFor ===
                                      `${translation.id}-${lang}` &&
                                      "bg-primary/10 opacity-100",
                                  )}
                                  title={`Generate ${lang.toUpperCase()} translation`}
                                >
                                  {generatingFor ===
                                  `${translation.id}-${lang}` ? (
                                    <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                  ) : (
                                    <Wand2 className="w-3 h-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Streamlined Export Panel */}
          {showExportPanel && (
            <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-bottom duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export Translations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Language Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Languages</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllLanguages}
                          className="text-xs h-7 bg-transparent"
                        >
                          All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={deselectAllLanguages}
                          className="text-xs h-7 bg-transparent"
                        >
                          None
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {languages.map((lang) => (
                        <div
                          key={lang}
                          className="flex items-center space-x-2 p-2 rounded-lg bg-muted/20"
                        >
                          <Checkbox
                            id={`export-${lang}`}
                            checked={selectedLanguages.includes(lang)}
                            onCheckedChange={() => toggleLanguage(lang)}
                          />
                          <label
                            htmlFor={`export-${lang}`}
                            className="text-sm cursor-pointer"
                          >
                            {lang.toUpperCase()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Format Options */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Format
                      </label>
                      <Select
                        value={exportFormat}
                        onValueChange={setExportFormat}
                      >
                        <SelectTrigger className="bg-muted/30 border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">
                            <div className="flex items-center gap-2">
                              <FileJson className="w-4 h-4" />
                              JSON
                            </div>
                          </SelectItem>
                          <SelectItem value="csv">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="w-4 h-4" />
                              CSV
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Structure
                      </label>
                      <Select
                        value={exportStructure}
                        onValueChange={setExportStructure}
                      >
                        <SelectTrigger className="bg-muted/30 border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="by-language">
                            By language
                          </SelectItem>
                          <SelectItem value="combined">Combined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowExportPanel(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={exportTranslations}
                    disabled={selectedLanguages.length === 0 || isExporting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  >
                    {isExporting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Export ({selectedLanguages.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
