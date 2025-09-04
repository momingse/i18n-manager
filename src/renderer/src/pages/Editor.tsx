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
import { cn } from "@/lib/utils";
import {
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
  Download,
  Edit3,
  Filter,
  Menu,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

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

  const {
    removeTranslationByKey,
    updateTranslationKey,
    updateTranslation,
    addTranslationKey,
  } = useProjectStore();
  const languages = useProjectStore(useShallow(currentProjectLanguageSelector));
  const currentProject = useProjectStore(useShallow(currentProjectSelector));

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

  const saveTranslations = async () => {
    // TODO: save translations
    toast("Saved", { description: "Changes saved successfully" });
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

  const handleCellBlur = () => {
    setEditingCell(null);

    if (!editingCell) return;

    if (editingCell?.lang) {
      updateTranslation(editingCell.lang, editingCell.key, tempValue);
    } else {
      updateTranslationKey(editingCell.key, tempValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell === null) return;

    if ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab") {
      e.preventDefault();
      setEditingCell(null);
      if (editingCell?.lang) {
        updateTranslation(editingCell.lang, editingCell.key, tempValue);
      } else {
        updateTranslationKey(editingCell.key, tempValue);
      }
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
              <Button
                onClick={saveTranslations}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Download className="w-4 h-4 mr-2" />
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
                          {/* <Button */}
                          {/*   variant="ghost" */}
                          {/*   size="sm" */}
                          {/*   className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all duration-200" */}
                          {/*   title="Edit" */}
                          {/* > */}
                          {/*   <Wand2 className="w-3 h-3" /> */}
                          {/* </Button> */}
                          {/* <Button */}
                          {/*   variant="ghost" */}
                          {/*   size="sm" */}
                          {/*   onClick={() => duplicateTranslation(translation.id)} */}
                          {/*   className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all duration-200" */}
                          {/*   title="Duplicate" */}
                          {/* > */}
                          {/*   <Copy className="w-3 h-3" /> */}
                          {/* </Button> */}
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
                              onKeyDown={(e) =>
                                handleKeyDown(e)
                              }
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
                                  onKeyDown={(e) =>
                                    handleKeyDown(e)
                                  }
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
                            {/* {translation.en && ( */}
                            {/*   <Button */}
                            {/*     variant="ghost" */}
                            {/*     size="sm" */}
                            {/*     disabled={ */}
                            {/*       generatingFor === `${translation.id}-${lang}` */}
                            {/*     } */}
                            {/*     className={cn( */}
                            {/*       "shrink-0 h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary transition-all duration-200 opacity-0 group-hover:opacity-100", */}
                            {/*       generatingFor === */}
                            {/*         `${translation.id}-${lang}` && */}
                            {/*         "bg-primary/10 opacity-100", */}
                            {/*     )} */}
                            {/*     title={`Generate ${lang.toUpperCase()} translation`} */}
                            {/*   > */}
                            {/*     {generatingFor === */}
                            {/*     `${translation.id}-${lang}` ? ( */}
                            {/*       <div className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> */}
                            {/*     ) : ( */}
                            {/*       <Wand2 className="w-3 h-3" /> */}
                            {/*     )} */}
                            {/*   </Button> */}
                            {/* )} */}
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
