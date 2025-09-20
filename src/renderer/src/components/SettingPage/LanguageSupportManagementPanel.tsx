import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentProjectSelector, useProjectStore } from "@/store/project";
import { ChevronDown, ChevronRight, Globe, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

// TODO: implement a better create language flow
const LanguageSupportManagementPanel = () => {
  const [expand, setExpand] = useState(true);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [newLanguage, setNewLanguage] = useState({
    filename: "",
    language: "",
  });

  const { updateProject } = useProjectStore();
  const currentProject = useProjectStore(useShallow(currentProjectSelector));

  if (!currentProject) {
    return null;
  }

  const handleAddLanguage = () => {
    if (!newLanguage.filename || !newLanguage.language) return;

    // check if language exists
    const languageExists = currentProject.fileLanguageMap.find(
      (lang) => lang.language === newLanguage.language,
    );
    if (languageExists) {
      toast.error("Language code already exists");
      return;
    }

    // check if filename exists
    const filenameExists = currentProject.fileLanguageMap.find(
      (lang) => lang.filename === newLanguage.filename,
    );
    if (filenameExists) {
      toast.error("Filename already exists");
      return;
    }

    const newLanguageWithId = {
      id: crypto.randomUUID(),
      filename: newLanguage.filename,
      language: newLanguage.language,
    };

    updateProject({
      ...currentProject,
      fileLanguageMap: [...currentProject.fileLanguageMap, newLanguageWithId],
    });
    setNewLanguage({ filename: "", language: "" });
    setShowLanguageDialog(false);
    toast("success", { description: "Language added successfully" });
  };

  const handleRemoveLanguage = (languageId: string) => {
    const languageExists = currentProject.fileLanguageMap.find(
      (lang) => lang.id === languageId,
    );

    if (!languageExists) return;

    updateProject({
      ...currentProject,
      fileLanguageMap: currentProject.fileLanguageMap.filter(
        (lang) => lang.id !== languageId,
      ),
    });

    toast("success", { description: "Language removed successfully" });
  };

  return (
    <>
      {/* Add Language Dialog using shadcn */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              Add New Language
            </DialogTitle>
            <DialogDescription>
              Add a new language to your project
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="language" className="text-right">
                Language
              </Label>
              <Input
                id="language"
                value={newLanguage.language}
                onChange={(e) =>
                  setNewLanguage((prev) => ({
                    ...prev,
                    language: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="e.g., German, Japanese, Portuguese"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filename" className="text-right">
                i18n Filename
              </Label>
              <Input
                id="filename"
                value={newLanguage.filename}
                onChange={(e) =>
                  setNewLanguage((prev) => ({
                    ...prev,
                    filename: e.target.value,
                  }))
                }
                className="col-span-3"
                placeholder="e.g., en.json, pt-BR.json"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLanguageDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleAddLanguage}
              disabled={!newLanguage.language || !newLanguage.filename}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Language
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg">
        <div
          className="p-6 cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
          onClick={() => setExpand(!expand)}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Language Support
                <span className="px-2 py-1 bg-muted rounded-full text-xs font-medium">
                  {currentProject.fileLanguageMap.length} languages
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage supported languages and set your default language
              </p>
            </div>
          </div>
          {expand ? (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {expand && (
          <div className="px-6 pb-6 border-t border-border/50 space-y-6 animate-in fade-in slide-in-from-top duration-300">
            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Supported Languages</h3>
              <Button
                onClick={() => setShowLanguageDialog(true)}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </div>

            <div className="space-y-2">
              {currentProject.fileLanguageMap.map((fileLanguage, index) => (
                <div
                  key={fileLanguage.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200 animate-in fade-in slide-in-from-left"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 border border-border rounded text-sm font-mono bg-background">
                      {fileLanguage.language}
                    </span>
                    <span className="font-medium">{fileLanguage.filename}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLanguage(fileLanguage.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LanguageSupportManagementPanel;
