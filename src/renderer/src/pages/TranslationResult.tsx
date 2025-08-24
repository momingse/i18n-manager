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
import { useProjectStore } from "@/store/project";
import { useSidebarStore } from "@/store/sidebar";
import {
  CheckCircle,
  Edit3,
  FileText,
  Languages,
  Menu,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
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

interface LanguageData {
  code: string;
  name: string;
  flag: string;
  translations: TranslationEntry[];
}

export default function TranslationResultsPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const { toggle } = useSidebarStore();

  const { currentProjectId, projects } = useProjectStore();
  const currentProject = projects[currentProjectId ?? ""];

  const analysisResults: LanguageData[] = useMemo(
    () => [
      {
        code: "en",
        name: "English",
        flag: "🇺🇸",
        translations: [
          {
            key: "common.welcome",
            value: "Welcome to our application",
            originalContext:
              "const welcomeMessage = 'Welcome to our application';",
            sourceFile: "src/components/Header.tsx",
            lineNumber: 15,
            fullFileContent: `import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className }) => {
  const { t } = useTranslation();
  
  const handleLogin = () => {
    // Handle login logic
  };

  const welcomeMessage = 'Welcome to our application';
  
  return (
    <header className={\`bg-white shadow-sm \${className}\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {welcomeMessage}
            </h1>
          </div>
          <nav className="flex space-x-8">
            <Button onClick={handleLogin}>
              {t('Login')}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};`,
            highlightStart: 398,
            highlightEnd: 431,
          },
          {
            key: "common.loading",
            value: "Loading...",
            originalContext:
              "<div className=\"loading\">{t('Loading...')}</div>",
            sourceFile: "src/components/Loader.tsx",
            lineNumber: 8,
            fullFileContent: `import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md' }) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="loading">{t('Loading...')}</div>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};`,
            highlightStart: 245,
            highlightEnd: 258,
          },
          {
            key: "navigation.home",
            value: "Home",
            originalContext: "<Link href=\"/\">{t('Home')}</Link>",
            sourceFile: "src/components/Navigation.tsx",
            lineNumber: 22,
          },
          {
            key: "navigation.about",
            value: "About",
            originalContext: "<Link href=\"/about\">{t('About')}</Link>",
            sourceFile: "src/components/Navigation.tsx",
            lineNumber: 23,
          },
          {
            key: "form.submit",
            value: "Submit",
            originalContext: "<Button type=\"submit\">{t('Submit')}</Button>",
            sourceFile: "src/components/ContactForm.tsx",
            lineNumber: 45,
          },
          {
            key: "form.cancel",
            value: "Cancel",
            originalContext:
              "<Button variant=\"outline\">{t('Cancel')}</Button>",
            sourceFile: "src/components/ContactForm.tsx",
            lineNumber: 46,
          },
        ],
      },
      {
        code: "es",
        name: "Spanish",
        flag: "🇪🇸",
        translations: [
          {
            key: "common.welcome",
            value: "Bienvenido a nuestra aplicación",
            originalContext:
              "const welcomeMessage = 'Welcome to our application';",
            sourceFile: "src/components/Header.tsx",
            lineNumber: 15,
          },
          {
            key: "common.loading",
            value: "Cargando...",
            originalContext:
              "<div className=\"loading\">{t('Loading...')}</div>",
            sourceFile: "src/components/Loader.tsx",
            lineNumber: 8,
          },
          {
            key: "navigation.home",
            value: "Inicio",
            originalContext: "<Link href=\"/\">{t('Home')}</Link>",
            sourceFile: "src/components/Navigation.tsx",
            lineNumber: 22,
          },
          {
            key: "navigation.about",
            value: "Acerca de",
            originalContext: "<Link href=\"/about\">{t('About')}</Link>",
            sourceFile: "src/components/Navigation.tsx",
            lineNumber: 23,
          },
          {
            key: "form.submit",
            value: "Enviar",
            originalContext: "<Button type=\"submit\">{t('Submit')}</Button>",
            sourceFile: "src/components/ContactForm.tsx",
            lineNumber: 45,
          },
          {
            key: "form.cancel",
            value: "Cancelar",
            originalContext:
              "<Button variant=\"outline\">{t('Cancel')}</Button>",
            sourceFile: "src/components/ContactForm.tsx",
            lineNumber: 46,
          },
        ],
      },
      {
        code: "fr",
        name: "French",
        flag: "🇫🇷",
        translations: [
          {
            key: "common.welcome",
            value: "Bienvenue dans notre application",
            originalContext:
              "const welcomeMessage = 'Welcome to our application';",
            sourceFile: "src/components/Header.tsx",
            lineNumber: 15,
          },
          {
            key: "common.loading",
            value: "Chargement...",
            originalContext:
              "<div className=\"loading\">{t('Loading...')}</div>",
            sourceFile: "src/components/Loader.tsx",
            lineNumber: 8,
          },
          {
            key: "navigation.home",
            value: "Accueil",
            originalContext: "<Link href=\"/\">{t('Home')}</Link>",
            sourceFile: "src/components/Navigation.tsx",
            lineNumber: 22,
          },
          {
            key: "navigation.about",
            value: "À propos",
            originalContext: "<Link href=\"/about\">{t('About')}</Link>",
            sourceFile: "src/components/Navigation.tsx",
            lineNumber: 23,
          },
          {
            key: "form.submit",
            value: "Soumettre",
            originalContext: "<Button type=\"submit\">{t('Submit')}</Button>",
            sourceFile: "src/components/ContactForm.tsx",
            lineNumber: 45,
          },
          {
            key: "form.cancel",
            value: "Annuler",
            originalContext:
              "<Button variant=\"outline\">{t('Cancel')}</Button>",
            sourceFile: "src/components/ContactForm.tsx",
            lineNumber: 46,
          },
        ],
      },
    ],
    [],
  );

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
    toast("Results saved", {
      description: "Translation results have been saved to your project",
    });
  };

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
              {analysisResults.map((lang) => (
                <TabsTrigger
                  key={lang.code}
                  value={lang.code}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <span className="text-lg">{lang.flag}</span>
                  {lang.name}
                  <Badge variant="secondary" className="text-xs">
                    {lang.translations.length}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {analysisResults.map((lang) => (
              <TabsContent
                key={lang.code}
                value={lang.code}
                className="space-y-6"
              >
                <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Languages className="w-5 h-5 text-blue-600" />
                      </div>
                      {lang.name} Translations
                      <span className="text-2xl ml-2">{lang.flag}</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                      Click on any translation to view its original context or
                      edit the value
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lang.translations.map((entry, index) => (
                        <div
                          key={entry.key}
                          className="group p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-200 animate-in fade-in slide-in-from-left"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                                  {entry.key}
                                </code>
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

                              {editingKey === entry.key ? (
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
                                  onClick={() => handleWordClick(entry)}
                                >
                                  "{entry.value}"
                                </div>
                              )}

                              {entry.sourceFile && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <FileText className="w-3 h-3" />
                                  {entry.sourceFile}
                                  {entry.lineNumber && (
                                    <span>:{entry.lineNumber}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditStart(entry.key, entry.value)
                                }
                                className="hover:bg-blue-500/20 hover:text-blue-600"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveKey(entry.key)}
                                className="hover:bg-destructive/20 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
