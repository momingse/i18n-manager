import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { matchesAnyPattern } from "@/lib/searchPattern";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project";
import {
  Check,
  ChevronDown,
  FileText,
  Minus,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function UploadPage() {
  const [searchPattern, setSearchPattern] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const dropDownRef = useRef(null);

  const { currentProjectId, projects, files } = useProjectStore();
  const currentProject = projects[currentProjectId ?? ""];

  const naviagation = useNavigate();

  const handleHideDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  useOnClickOutside({
    ref: dropDownRef,
    handler: handleHideDropdown,
  });

  const filteredFiles = useMemo(() => {
    if (!searchPattern.trim()) return [];

    const pattern = searchPattern.trim();

    // Split pattern by spaces to handle multiple patterns
    const patterns = pattern.split(/\s+/).filter((p) => p.length > 0);

    // Separate inclusion and exclusion patterns
    const inclusionPatterns = patterns.filter((p) => !p.startsWith("!"));
    const exclusionPatterns = patterns
      .filter((p) => p.startsWith("!"))
      .map((p) => p.slice(1));

    let results = files;

    // Apply inclusion filters (if any)
    if (inclusionPatterns.length > 0) {
      results = files.filter((file) =>
        matchesAnyPattern(file, inclusionPatterns),
      );
    }

    // Apply exclusion filters
    if (exclusionPatterns.length > 0) {
      results = results.filter(
        (file) => !matchesAnyPattern(file, exclusionPatterns, true),
      );
    }

    // Sort results by relevance
    results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const searchLower =
        inclusionPatterns[0]?.toLowerCase() || pattern.toLowerCase();

      // Exact name matches first
      if (aName === searchLower && bName !== searchLower) return -1;
      if (bName === searchLower && aName !== searchLower) return 1;

      // Name starts with pattern
      const aStartsWith = aName.startsWith(searchLower);
      const bStartsWith = bName.startsWith(searchLower);
      if (aStartsWith && !bStartsWith) return -1;
      if (bStartsWith && !aStartsWith) return 1;

      // Name contains pattern
      const aNameContains = aName.includes(searchLower);
      const bNameContains = bName.includes(searchLower);
      if (aNameContains && !bNameContains) return -1;
      if (bNameContains && !aNameContains) return 1;

      // Alphabetical order as fallback
      return aName.localeCompare(bName);
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [files, searchPattern]);

  const handlePatternChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchPattern(e.target.value);
    setShowDropdown(e.target.value.trim().length > 0);
  };

  const handleFileAction = (filePath: string) => {
    if (!selectedFiles.includes(filePath)) {
      handleAddFile(filePath);
    } else {
      handleRemoveFile(filePath);
    }
    setSearchPattern("");
    setShowDropdown(false);
  };

  const handleAddFile = (filePath: string) => {
    setSelectedFiles((prev) => [...prev, filePath]);
  };

  const handleAddAllFile = () => {
    setSelectedFiles((prev) => [...prev, ...filteredFiles.map((f) => f.path)]);
  };

  const handleRemoveFile = (filePath: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== filePath));
  };

  const handleRemoveAllFile = () => {
    setSelectedFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filteredFiles.length > 0) {
      handleAddAllFile();
      setShowDropdown(false);
    }
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      toast.error("No files selected");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate AI analysis
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast("Analysis complete", {
        description: `Found translatable content in ${selectedFiles.length} files`,
      });

      naviagation("/analyze");
    } catch (error) {
      toast.error("Analysis failed", {
        description: "Please try again",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-600">
          <h1 className="text-3xl font-bold mb-2">File Analysis</h1>
          <p className="text-muted-foreground">
            Select files from your project to analyze for translation
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                Project Files
              </CardTitle>
              <CardDescription className="text-base">
                Search and select files to analyze for translatable content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files or enter patterns (e.g., *.tsx, components/*, locales/)"
                    value={searchPattern}
                    onChange={handlePatternChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() =>
                      setShowDropdown(searchPattern.trim().length > 0)
                    }
                    className="pl-10 pr-4 h-12 text-base border-0 bg-muted/50 focus:bg-muted/70 transition-colors duration-200"
                  />
                  {showDropdown && (
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {showDropdown && filteredFiles.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 z-10 mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    ref={dropDownRef}
                  >
                    {filteredFiles.map((file) => {
                      const isFileSelected = selectedFiles.includes(file.path);
                      return (
                        <div
                          key={file.path}
                          className={cn(
                            "flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors duration-150",
                            isFileSelected &&
                              "bg-primary/10 border-l-2 border-l-primary",
                          )}
                          onClick={() => handleFileAction(file.path)}
                        >
                          <div className="flex items-center gap-3">
                            <FileText
                              className={cn(
                                "w-4 h-4",
                                isFileSelected
                                  ? "text-primary"
                                  : "text-muted-foreground",
                              )}
                            />
                            <div>
                              <div
                                className={cn(
                                  "font-medium text-sm flex items-center gap-2",
                                  isFileSelected && "text-primary",
                                )}
                              >
                                {file.name}
                                {isFileSelected && (
                                  <Check className="w-3 h-3 text-primary" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {file.path}
                              </div>
                            </div>
                          </div>
                          {isFileSelected ? (
                            <Minus className="w-4 h-4 text-destructive" />
                          ) : (
                            <Plus className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-400">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Selected Files</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {selectedFiles.length} file
                        {selectedFiles.length !== 1 ? "s" : ""}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAllFile}
                        className="text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-colors duration-200 bg-transparent"
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedFiles.map((filePath, index) => {
                      const file = files.find((f) => f.path === filePath);
                      return (
                        <div
                          key={filePath}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200 animate-in fade-in slide-in-from-left"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {file?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {filePath}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(filePath)}
                            className="hover:bg-destructive/20 hover:text-destructive transition-colors duration-200"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleAnalyze}
                  disabled={selectedFiles.length === 0 || isAnalyzing}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing Files...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Analyze for Translation
                    </div>
                  )}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-4">
                <p className="font-medium mb-2">Search Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • Use wildcards:{" "}
                    <code className="bg-muted px-1 rounded">*.tsx</code> for all
                    TypeScript files
                  </li>
                  <li>
                    • Search folders:{" "}
                    <code className="bg-muted px-1 rounded">components/</code>{" "}
                    for all files in components
                  </li>
                  <li>
                    • Combine patterns:{" "}
                    <code className="bg-muted px-1 rounded">src/*.json</code>{" "}
                    for JSON files in src
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
