import { useProjectStore } from "@/store/project";
import { ChevronDown, ChevronRight, Edit3, Globe, Save, X } from "lucide-react";
import { useRef, useState } from "react";

const I18nConfigurePanel = () => {
  const [tempI18nPath, setTempI18nPath] = useState("");
  const [expand, setExpand] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const i18nPathInputRef = useRef<HTMLInputElement>(null);

  const { currentProjectId, projects, updateProject } = useProjectStore();
  const currentProject = projects[currentProjectId ?? ""];

  const handleI18nPathEdit = () => {
    setTempI18nPath(currentProject.i18nPath);
    setEditMode(true);
  };

  const handleI18nPathSave = () => {
    updateProject({
      ...currentProject,
      i18nPath: tempI18nPath.trim(),
    });
    setEditMode(false);
  };

  const handleI18nPathCancel = () => {
    setTempI18nPath("");
    setEditMode(false);
  };

  const handleI18nPathKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleI18nPathSave();
    } else if (e.key === "Escape") {
      handleI18nPathCancel();
    }
  };

  if (!currentProject) {
    return null;
  }

  return (
    <div className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg">
      <div
        className="p-6 cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
        onClick={() => setExpand(!expand)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">
              Internationalization (i18n)
            </h2>
            <p className="text-sm text-muted-foreground">
              Configure your translation files and language resources directory
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
        <div className="px-6 pb-6 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="mt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              i18n Folder Location
            </label>
            <div className="flex items-center gap-3">
              {editMode ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    ref={i18nPathInputRef}
                    type="text"
                    value={tempI18nPath}
                    onChange={(e) => setTempI18nPath(e.target.value)}
                    onKeyDown={handleI18nPathKeyDown}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    placeholder="Enter i18n path..."
                  />
                </div>
              ) : (
                <div className="flex-1 px-3 py-2 bg-muted/30 rounded-lg border-0">
                  <code className="text-sm font-mono">
                    {currentProject.i18nPath}
                  </code>
                </div>
              )}
              <div className="flex items-center gap-2">
                {editMode ? (
                  <>
                    <button
                      onClick={handleI18nPathSave}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleI18nPathCancel}
                      className="p-2 border border-border rounded-md hover:bg-muted/50 transition-colors text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleI18nPathEdit}
                    className="px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default I18nConfigurePanel;
