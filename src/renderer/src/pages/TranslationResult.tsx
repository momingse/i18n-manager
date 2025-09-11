import ConflictResolver, {
  Conflict,
  ConflictResolution,
} from "@/components/TranslationResultPage/ConflictResolver";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentProjectSelector, useProjectStore } from "@/store/project";
import { useSidebarStore } from "@/store/sidebar";
import { useTranslationStore } from "@/store/translation";
import {
  CheckCircle,
  Edit3,
  Languages,
  Menu,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

interface TranslationEntry {
  key: string;
  value: string;
  originalContext?: string;
  sourceFile?: string;
  lineNumber?: number;
  fullFileContent?: string;
  highlightStart?: number;
  highlightEnd?: number;
}

export default function TranslationResultsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [keyToRemove, setKeyToRemove] = useState<{
    language: string;
    key: string;
  } | null>(null);

  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [showConflictResolver, setShowConflictResolver] = useState(false);

  const { toggle } = useSidebarStore();
  const { translationResult, updateTranslation, removeTranslationKey } =
    useTranslationStore();
  const { updateData } = useProjectStore();
  const currentProject = useProjectStore(useShallow(currentProjectSelector));

  const navigation = useNavigate();

  useEffect(() => {
    if (!translationResult || Object.keys(translationResult).length === 0) {
      navigation("/");
      return;
    }

    setSelectedLanguage(Object.keys(translationResult)[0]);
  }, [translationResult, navigation]);

  if (!currentProject) {
    return null;
  }

  const handleEditStart = (key: string, value: string) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  const handleEditSave = () => {
    if (editingKey) {
      updateTranslation(selectedLanguage, editingKey, editingValue);
      toast("Translation updated", {
        description: `Updated "${editingKey}" successfully`,
      });
      setEditingKey(null);
      setEditingValue("");
    }
  };

  const handleEditCancel = () => {
    setEditingKey(null);
    setEditingValue("");
  };

  const handleRemoveKeyClick = (language: string, key: string) => {
    setKeyToRemove({ language, key });
  };

  const handleRemoveCurrentLanguage = () => {
    if (keyToRemove) {
      removeTranslationKey(keyToRemove.language, keyToRemove.key);
      toast("Translation removed", {
        description: `Removed "${keyToRemove.key}" from ${keyToRemove.language}`,
      });
      setKeyToRemove(null);
    }
  };

  const handleRemoveAllLanguages = () => {
    if (keyToRemove && translationResult) {
      const languages = Object.keys(translationResult);
      languages.forEach((lang) => {
        if (translationResult[lang][keyToRemove.key]) {
          removeTranslationKey(lang, keyToRemove.key);
        }
      });
      toast("Translation removed", {
        description: `Removed "${keyToRemove.key}" from all languages`,
      });
      setKeyToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setKeyToRemove(null);
  };

  const handleWordClick = (entry: TranslationEntry) => {
    // TODO: handle context drawer open
  };

  const handleResolveConflict = (resolutions: ConflictResolution[]) => {
    setShowConflictResolver(false);
    setConflicts([]);

    resolutions.forEach((resolution) => {
      if (resolution.action === "useCustom") {
        updateTranslation(
          resolution.language,
          resolution.key,
          resolution.customValue,
        );
      }

      if (resolution.action === "originalValue") {
        removeTranslationKey(resolution.language, resolution.key);
      }
    });

    toast("Conflicts resolved", {
      description: "Translation conflicts have been resolved",
    });
  };

  const handleSaveResults = async () => {
    if (!translationResult) {
      return;
    }

    // check conflicts
    const languages = Object.keys(translationResult);
    const conflicts = languages.reduce<Conflict[]>((acc, lang) => {
      const translations = translationResult[lang];
      const projectData = currentProject.data[lang] || {};

      Object.keys(translations).forEach((translationKey) => {
        if (
          translationKey in projectData &&
          projectData[translationKey] !== translations[translationKey]
        ) {
          acc.push({
            key: translationKey,
            language: lang,
            originalValue: projectData[translationKey],
            newValue: translations[translationKey],
          });
        }
      });

      return acc;
    }, []);

    if (conflicts.length > 0) {
      setConflicts(conflicts);
      setShowConflictResolver(true);
      return;
    }

    try {
      updateData(translationResult);
      toast("Results saved", {
        description: "Translation results have been saved to your project",
      });

      navigation("/");
    } catch (error) {
      toast("Failed to save", {
        description: "There was an error saving your translation results",
      });
    }
  };

  // Check if key exists in other languages
  const getKeyLanguageCount = (key: string) => {
    if (!translationResult) return 0;
    return Object.keys(translationResult).filter(
      (lang) => translationResult[lang][key],
    ).length;
  };

  if (!translationResult || Object.keys(translationResult).length === 0) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Button variant="outline" onClick={toggle}>
                <Menu className="w-6 h-6" />
              </Button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Languages className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Translation Results</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveResults}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <Tabs
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3 h-12">
              {Object.keys(translationResult).map((lang) => (
                <TabsTrigger
                  key={lang}
                  value={lang}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  {lang}
                  <Badge variant="secondary" className="text-xs">
                    {Object.keys(translationResult[lang]).length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(translationResult).map((lang) => (
              <TabsContent key={lang} value={lang} className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Languages className="w-5 h-5 text-blue-600" />
                      </div>
                      {lang} Translations
                    </CardTitle>
                    <CardDescription className="text-base">
                      Click on any translation to view its original context or
                      edit the value
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(translationResult[lang]).map(
                        ([translationKey, translationValue], index) => (
                          <div
                            key={translationKey}
                            className="group p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-200 animate-in fade-in slide-in-from-left"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                    {translationKey}
                                  </code>
                                  {/* TODO: handle context drawer open */}
                                  {/* <Button */}
                                  {/*   variant="ghost" */}
                                  {/*   size="sm" */}
                                  {/*   onClick={() => handleWordClick(entry)} */}
                                  {/*   className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" */}
                                  {/* > */}
                                  {/*   <Eye className="w-3 h-3 mr-1" /> */}
                                  {/*   Context */}
                                  {/* </Button> */}
                                </div>

                                {editingKey === translationKey ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editingValue}
                                      onChange={(e) =>
                                        setEditingValue(e.target.value)
                                      }
                                      className="flex-1"
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={handleEditSave}
                                      className="bg-green-500 hover:bg-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleEditCancel}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    className="text-base font-medium cursor-pointer hover:text-primary transition-colors duration-200"
                                    // onClick={() => handleWordClick(transitionKey)}
                                  >
                                    "{translationValue}"
                                  </div>
                                )}

                                {/*   {entry.sourceFile && ( */}
                                {/*     <div className="flex items-center gap-2 text-xs text-muted-foreground"> */}
                                {/*       <FileText className="w-3 h-3" /> */}
                                {/*       {entry.sourceFile} */}
                                {/*       {entry.lineNumber && ( */}
                                {/*         <span>:{entry.lineNumber}</span> */}
                                {/*       )} */}
                                {/*     </div> */}
                                {/*   )} */}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleEditStart(
                                      translationKey,
                                      translationValue,
                                    )
                                  }
                                  className="hover:bg-blue-500/20 hover:text-blue-600"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveKeyClick(lang, translationKey)
                                  }
                                  className="hover:bg-destructive/20 hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <ConflictResolver
          conflicts={conflicts}
          show={showConflictResolver}
          closeResolver={() => setShowConflictResolver(false)}
          handleResolveConflict={handleResolveConflict}
        />

        <Dialog open={!!keyToRemove} onOpenChange={() => setKeyToRemove(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-destructive" />
                Remove Translation Key
              </DialogTitle>
              <DialogDescription className="space-y-2">
                <div>
                  You're about to remove the key{" "}
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {keyToRemove?.key}
                  </code>
                </div>
                <div className="text-sm text-muted-foreground">
                  This key exists in{" "}
                  <span className="font-medium">
                    {keyToRemove ? getKeyLanguageCount(keyToRemove.key) : 0}
                  </span>{" "}
                  language(s). Choose your action:
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col space-y-2">
              <Button
                variant="outline"
                onClick={handleCancelRemove}
                className="w-full"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveCurrentLanguage}
                className="w-full"
              >
                <Trash2 className="w-4 h-4" />
                Remove from {keyToRemove?.language} only
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemoveAllLanguages}
                className="w-full"
              >
                <Trash2 className="w-4 h-4" />
                Remove from all languages
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
