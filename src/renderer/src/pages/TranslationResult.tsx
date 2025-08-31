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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebarStore } from "@/store/sidebar";
import { useTranslationStore } from "@/store/translation";
import {
  CheckCircle,
  Languages,
  Menu,
  Save,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

  const { toggle } = useSidebarStore();

  const { translationResult } = useTranslationStore();

  const navigation = useNavigate();

  useEffect(() => {
    if (!translationResult || Object.keys(translationResult).length === 0) {
      navigation("/");
      return;
    }

    setSelectedLanguage(Object.keys(translationResult)[0]);
  }, [translationResult, navigation]);

  const handleEditStart = (key: string, value: string) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  const handleEditSave = () => {
    toast("Translation updated", {
      description: `Updated "${editingKey}" successfully`,
    });
    setEditingKey(null);
    setEditingValue("");
  };

  const handleEditCancel = () => {
    setEditingKey(null);
    setEditingValue("");
  };

  const handleRemoveKey = (key: string) => {
    toast("Translation removed", {
      description: `Removed "${key}" from translations`,
    });
  };

  const handleWordClick = (entry: TranslationEntry) => {
    // TODO: handle context drawer open
  };

  const handleSaveResults = () => {
    // TODO: handle saving
    toast("Results saved", {
      description: "Translation results have been saved to your project",
    });
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
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
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
                    {translationResult[lang].length}
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
                        ([transitionKey, translationValue], index) => (
                          <div
                            key={transitionKey}
                            className="group p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-200 animate-in fade-in slide-in-from-left"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                    {transitionKey}
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

                                {editingKey === transitionKey ? (
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
                              {/* </div> */}

                              {/* <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"> */}
                              {/*   <Button */}
                              {/*     variant="ghost" */}
                              {/*     size="sm" */}
                              {/*     onClick={() => */}
                              {/*       handleEditStart(entry.key, entry.value) */}
                              {/*     } */}
                              {/*     className="hover:bg-blue-500/20 hover:text-blue-600" */}
                              {/*   > */}
                              {/*     <Edit3 className="w-4 h-4" /> */}
                              {/*   </Button> */}
                              {/*   <Button */}
                              {/*     variant="ghost" */}
                              {/*     size="sm" */}
                              {/*     onClick={() => handleRemoveKey(entry.key)} */}
                              {/*     className="hover:bg-destructive/20 hover:text-destructive" */}
                              {/*   > */}
                              {/*     <Trash2 className="w-4 h-4" /> */}
                              {/*   </Button> */}
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
      </div>
    </div>
  );
}
