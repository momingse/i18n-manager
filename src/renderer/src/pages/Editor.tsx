import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useMac } from "@/hooks/useDevice";
import { cn } from "@/lib/utils";
import {
  canRedoSelector,
  canUndoSelector,
  currentProjectLanguageSelector,
  currentProjectSelector,
  useProjectStore,
} from "@/store/project";
import { useSidebarStore } from "@/store/sidebar";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit3,
  Filter,
  Menu,
  Plus,
  Redo,
  Save,
  Search,
  Trash2,
  Undo,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { useConfirmStore } from "@/store/confirmStore";
import path from "path-browserify";

export interface Translation {
  key: string;
  [language: string]: string;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export default function EditorPage() {
  const [newKey, setNewKey] = useState("");
  const [editingCell, setEditingCell] = useState<{
    key: string;
    lang?: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [tempValue, setTempValue] = useState("");

  const isMac = useMac();

  const { addConfirmation } = useConfirmStore();

  const {
    removeTranslationByKey,
    updateTranslationKey,
    updateTranslation,
    addTranslationKey,
    undoTranslation,
    redoTranslation,
    updateDataByLanguage,
    checkProjectDataConsistency,
  } = useProjectStore();

  const languages = useProjectStore(useShallow(currentProjectLanguageSelector));
  const currentProject = useProjectStore(useShallow(currentProjectSelector));
  const canRedo = useProjectStore(useShallow(canRedoSelector));
  const canUndo = useProjectStore(useShallow(canUndoSelector));

  const translations = useMemo<Translation[]>(() => {
    if (!currentProject) return [];

    const keys = new Set<string>();
    for (const lang in currentProject.data) {
      for (const key in currentProject.data[lang]) {
        keys.add(key);
      }
    }

    return Array.from(keys)
      .map((key) => ({
        key,
        ...Object.keys(currentProject.data).reduce(
          (acc, language) => ({
            ...acc,
            [language]: currentProject.data[language]?.[key] ?? "",
          }),
          {} as Record<string, string>,
        ),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [currentProject]);

  const { toggle } = useSidebarStore();

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

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    undoTranslation();
    toast.success("Undone", {
      description: "Last action has been undone",
      duration: 2000,
    });
  }, [canUndo, undoTranslation]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    redoTranslation();
    toast.success("Redone", {
      description: "Action has been redone",
      duration: 2000,
    });
  }, [canRedo, redoTranslation]);

  // Keyboard shortcuts for undo/redo with proper Mac/Windows support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is editing a cell
      if (editingCell) return;

      const modifierKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl+Z (Windows) or Cmd+Z (Mac)
      if (modifierKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Redo: Ctrl+Y (Windows) or Cmd+Shift+Z (Mac) or Ctrl+Shift+Z (both)
      if (
        modifierKey &&
        ((e.key === "y" && !isMac) || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingCell, handleRedo, handleUndo, isMac]);

  const syncTranslation = async () => {
    const isConsistent = await checkProjectDataConsistency();
    if (isConsistent) {
      toast.success("Already in sync", {
        description: "Translation data is consistent with files",
      });
      return;
    }

    addConfirmation({
      title: "Sync translations",
      description:
        "Detected translation data is out of sync. Do you want to sync it?",
      actions: [
        {
          key: "overwrite",
          text: "Overwrite files",
          variant: "destructive",
          callbackFn: async () => {
            try {
              if (!currentProject) return;

              // Write current project data to all files
              for (const langMap of currentProject.fileLanguageMap) {
                const filePath = path.join(
                  currentProject.i18nPath,
                  langMap.filename,
                );
                const data = currentProject.data[langMap.language] || {};
                const jsonContent = JSON.stringify(data, null, 2);

                await window.electronAPI.fileManager.writeFileContent(
                  filePath,
                  jsonContent,
                );
              }

              toast.success("Files overwritten", {
                description:
                  "All translation files have been updated with current data",
              });
            } catch (error) {
              console.error("Failed to overwrite files:", error);
              toast.error("Failed to overwrite files", {
                description: "An error occurred while writing to files",
              });
            }
          },
        },
        {
          key: "restore",
          text: "Restore from files",
          variant: "outline",
          callbackFn: async () => {
            try {
              if (!currentProject) return;

              for (const langMap of currentProject.fileLanguageMap) {
                const filePath = path.join(
                  currentProject.i18nPath,
                  langMap.filename,
                );

                try {
                  const content =
                    await window.electronAPI.fileManager.readFileContent(
                      filePath,
                    );

                  const fileContent = content ? JSON.parse(content) : {};
                  updateDataByLanguage(langMap.language, fileContent);
                } catch (parseError) {
                  console.warn(
                    `Failed to parse ${filePath}, using empty object`,
                  );
                  updateDataByLanguage(langMap.language, {});
                }
              }

              toast.success("Data restored", {
                description:
                  "Project data has been restored from translation files",
              });
            } catch (error) {
              console.error("Failed to restore from files:", error);
              toast.error("Failed to restore data", {
                description: "An error occurred while reading from files",
              });
            }
          },
        },
        {
          key: "skip",
          text: "Skip",
          variant: "outline",
        },
      ],
    });
  };

  const addNewTranslationKey = () => {
    if (!newKey.trim()) return;

    // check if key already exists
    if (translations.some((t) => t.key === newKey)) {
      toast("Error", { description: "Key already exists" });
      return;
    }

    addTranslationKey(newKey);
    toast("Added", { description: "New translation added successfully" });

    setNewKey("");
    setCurrentPage(1);
  };

  const deleteTranslation = (key: string) => {
    const translationKey = translations.find((t) => t.key === key)?.key;
    if (!translationKey) return;

    removeTranslationByKey(translationKey);
    toast.success("Deleted", { description: "Translation key deleted" });
  };

  const handleSearching = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCellClick = (key: string, lang?: string) => {
    const value = lang
      ? (translations.find((t) => t.key === key)?.[lang] ?? "")
      : key;
    setTempValue(value);
    setEditingCell({ key, lang });
  };

  const handleUpdateTranslationKey = (key: string, value: string) => {
    if (translations.some((t) => t.key === value) && key !== value) {
      toast("Error", { description: "Key already exists" });
      return;
    }
    updateTranslationKey(key, value);
    toast.success("Updated", { description: "Translation key updated" });
  };

  const handleCellBlur = () => {
    if (!editingCell) return;

    if (editingCell?.lang) {
      updateTranslation(editingCell.lang, editingCell.key, tempValue);
    } else {
      handleUpdateTranslationKey(editingCell.key, tempValue);
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell === null) return;

    if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
      e.preventDefault();
      if (editingCell?.lang) {
        updateTranslation(editingCell.lang, editingCell.key, tempValue);
      } else {
        handleUpdateTranslationKey(editingCell.key, tempValue);
      }
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

  // Get shortcut text based on platform
  const getShortcutText = (action: "undo" | "redo") => {
    if (action === "undo") {
      return isMac ? "⌘Z" : "Ctrl+Z";
    } else {
      return isMac ? "⌘⇧Z" : "Ctrl+Y";
    }
  };

  if (!currentProject) return null;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-6 py-6 max-w-full">
        <div className="mb-6">
          {/* Clean Header */}
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
              {/* Undo/Redo Controls */}
              <div className="hidden sm:flex items-center gap-1 mr-2 p-1 bg-card/30 rounded-lg border border-border/30">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className={cn(
                    "h-8 px-3 text-xs hover:bg-muted/50 transition-all duration-200",
                    canUndo
                      ? "text-foreground hover:text-primary"
                      : "text-muted-foreground cursor-not-allowed",
                  )}
                  title={`Undo (${getShortcutText("undo")})`}
                >
                  <Undo className="w-4 h-4 mr-1" />
                  Undo
                </Button>
                <div className="w-px h-4 bg-border/50" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className={cn(
                    "h-8 px-3 text-xs hover:bg-muted/50 transition-all duration-200",
                    canRedo
                      ? "text-foreground hover:text-primary"
                      : "text-muted-foreground cursor-not-allowed",
                  )}
                  title={`Redo (${getShortcutText("redo")})`}
                >
                  <Redo className="w-4 h-4 mr-1" />
                  Redo
                </Button>
              </div>

              {/* Mobile Undo/Redo */}
              <div className="sm:hidden flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className={cn(
                    "h-9 w-9 p-0",
                    canUndo
                      ? "hover:bg-muted hover:text-primary"
                      : "text-muted-foreground cursor-not-allowed",
                  )}
                  title={`Undo (${getShortcutText("undo")})`}
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className={cn(
                    "h-9 w-9 p-0",
                    canRedo
                      ? "hover:bg-muted hover:text-primary"
                      : "text-muted-foreground cursor-not-allowed",
                  )}
                  title={`Redo (${getShortcutText("redo")})`}
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={syncTranslation}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Save className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sync</span>
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
                  onChange={handleSearching}
                  className="pl-10 bg-background/50 border-0 focus:bg-background/70"
                />
              </div>

              <div className="flex gap-2 flex-col sm:flex-row">
                <Input
                  placeholder="Add new key..."
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && addNewTranslationKey()
                  }
                  className="w-48 bg-background/50 border-0 focus:bg-background/70 flex-1"
                />
                <Button
                  onClick={addNewTranslationKey}
                  disabled={!newKey.trim()}
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

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

          {/* History Status Bar */}
          {(canUndo || canRedo) && (
            <div className="mt-4 px-4 py-2 bg-muted/20 rounded-lg border border-border/20">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>History Status:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        canUndo ? "text-foreground" : "",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          canUndo ? "bg-green-500" : "bg-muted-foreground/30",
                        )}
                      />
                      {currentProject?.undoableStack.undoStack.length || 0}{" "}
                      actions available to undo
                    </span>
                    <span className="text-muted-foreground/50">•</span>
                    <span
                      className={cn(
                        "flex items-center gap-1",
                        canRedo ? "text-foreground" : "",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          canRedo ? "bg-blue-500" : "bg-muted-foreground/30",
                        )}
                      />
                      {currentProject?.undoableStack.redoStack.length || 0}{" "}
                      actions available to redo
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block text-muted-foreground/70">
                  Use {getShortcutText("undo")} to undo,{" "}
                  {getShortcutText("redo")} to redo
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Simplified Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 bg-card/20 backdrop-blur-sm rounded-lg border border-border/20">
            <div className="text-sm text-muted-foreground">
              {startIndex + 1}–{Math.min(endIndex, filteredTranslations.length)}{" "}
              of {filteredTranslations.length}
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
                      key={translation.key}
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
                            onClick={() => deleteTranslation(translation.key)}
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
                          globalIndex % 2 === 0
                            ? "bg-background/40"
                            : "bg-muted/5",
                        )}
                      >
                        <div className="relative">
                          {editingCell?.key === translation.key &&
                          !editingCell?.lang ? (
                            <Input
                              value={tempValue}
                              onChange={(e) => setTempValue(e.target.value)}
                              onBlur={handleCellBlur}
                              onKeyDown={(e) => handleKeyDown(e)}
                              className="font-mono text-sm bg-inherit border-2 border-primary/50 focus:border-primary"
                              autoFocus
                            />
                          ) : (
                            <div
                              onClick={() => handleCellClick(translation.key)}
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
                              {editingCell?.key === translation.key &&
                              editingCell?.lang === lang ? (
                                <Textarea
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  onBlur={handleCellBlur}
                                  onKeyDown={(e) => handleKeyDown(e)}
                                  placeholder={`${lang} translation...`}
                                  rows={2}
                                  className="resize-none bg-white border-2 border-primary/50 focus:border-primary text-sm"
                                  autoFocus
                                />
                              ) : (
                                <div
                                  onClick={() =>
                                    handleCellClick(translation.key, lang)
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
      </div>
    </div>
  );
}
