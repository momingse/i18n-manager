import { useProjectStore } from "@/store/project";
import { ChevronDown, ChevronRight, Globe, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LanguageSupportManagementPanel = () => {
  const [expand, setExpand] = useState(true);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [newLanguage, setNewLanguage] = useState({
    filename: "",
    language: "",
  });

  const { projects, currentProjectId, updateProject } = useProjectStore();
  const currentProject = projects[currentProjectId ?? ""];

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

  if (!currentProject) {
    return null;
  }

  return (
    <>
      {/* Add Language Dialog */}
      {showLanguageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg max-w-md w-full mx-4 border-0">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Add New Language</h3>
                  <p className="text-sm text-muted-foreground">
                    Add a new language to your project
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Language
                  </label>
                  <input
                    type="text"
                    value={newLanguage.language}
                    onChange={(e) =>
                      setNewLanguage((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border-0 bg-muted/50 focus:bg-muted/70 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    placeholder="e.g., de, ja, pt"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    i18n Filename
                  </label>
                  <input
                    type="text"
                    value={newLanguage.filename}
                    onChange={(e) =>
                      setNewLanguage((prev) => ({
                        ...prev,
                        filename: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border-0 bg-muted/50 focus:bg-muted/70 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    placeholder="e.g., German, Japanese, Portuguese"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={() => setShowLanguageDialog(false)}
                  className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLanguage}
                  disabled={!newLanguage.language || !newLanguage.filename}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Language
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <button
                onClick={() => setShowLanguageDialog(true)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Language
              </button>
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
                    <button
                      onClick={() => handleRemoveLanguage(fileLanguage.id)}
                      className="p-1 rounded transition-colors text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
