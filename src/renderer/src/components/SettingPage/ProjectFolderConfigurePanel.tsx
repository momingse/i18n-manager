import { currentProjectSelector, useProjectStore } from "@/store/project";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Folder,
  Save,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";

const ProjectFolderConfigurePanel = () => {
  const [tempProjectPath, setTempProjectPath] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const projectPathInputRef = useRef<HTMLInputElement>(null);

  const { updateProject } = useProjectStore();
  const currentProject = useProjectStore(useShallow(currentProjectSelector));

  if (!currentProject) {
    return null;
  }

  const handleProjectPathEdit = () => {
    setTempProjectPath(currentProject.path);
    setEditMode(true);
  };

  const handleProjectPathSave = () => {
    if (tempProjectPath.trim() === "") {
      toast.error("Project path cannot be empty");
      return;
    }

    updateProject({
      ...currentProject,
      path: tempProjectPath.trim(),
    });
    setEditMode(false);
    toast("success", {
      description: "Project folder location updated successfully",
    });

    setTempProjectPath("");
  };

  const handleProjectPathCancel = () => {
    setTempProjectPath("");
    setEditMode(false);
  };

  const handleProjectPathKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleProjectPathSave();
    } else if (e.key === "Escape") {
      handleProjectPathCancel();
    }
  };

  return (
    <div className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg">
      <div
        className="p-6 cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Folder className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Project Folder Location</h2>
            <p className="text-sm text-muted-foreground">
              The root directory of your project where all project files are
              stored
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* TODO: change this to browser path */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="mt-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Current Project Path
            </label>
            <div className="flex items-center gap-3">
              {editMode ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    ref={projectPathInputRef}
                    type="text"
                    value={tempProjectPath}
                    onChange={(e) => setTempProjectPath(e.target.value)}
                    onKeyDown={handleProjectPathKeyDown}
                    className="flex-1 px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                    placeholder="Enter project path..."
                  />
                </div>
              ) : (
                <div className="flex-1 px-3 py-2 bg-muted/30 rounded-lg border-0">
                  <code className="text-sm font-mono">
                    {currentProject.path}
                  </code>
                </div>
              )}
              <div className="flex items-center gap-2">
                {editMode ? (
                  <>
                    <button
                      onClick={handleProjectPathSave}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleProjectPathCancel}
                      className="p-2 border border-border rounded-md hover:bg-muted/50 transition-colors text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleProjectPathEdit}
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

export default ProjectFolderConfigurePanel;
