import { ConfirmationDialog } from "@/components/SettingPage/RemoveProjectConfirmationDialog";
import { i18nLanguage, useProjectStore } from "@/store/project";
import { useSidebarStore } from "@/store/sidebar";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Folder,
  Globe,
  Menu,
  Plus,
  Settings,
  Trash2,
  Edit3,
  Save,
  X,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState({
    project: true,
    i18n: true,
    languages: true,
    danger: false,
  });

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);

  // Edit mode states
  const [projectPathEditMode, setProjectPathEditMode] = useState(false);
  const [i18nPathEditMode, setI18nPathEditMode] = useState(false);
  const [tempProjectPath, setTempProjectPath] = useState("");
  const [tempI18nPath, setTempI18nPath] = useState("");

  // Form states
  const [newLanguage, setNewLanguage] = useState<Omit<i18nLanguage, "id">>({
    filename: "",
    language: "",
  });

  // Refs for input elements
  const projectPathInputRef = useRef<HTMLInputElement>(null);
  const i18nPathInputRef = useRef<HTMLInputElement>(null);

  const { toggle } = useSidebarStore();

  const { currentProjectId, projects, updateProject, removeCurrentProject } =
    useProjectStore();
  const currentProject = projects[currentProjectId ?? ""];

  // Focus input when entering edit mode
  useEffect(() => {
    if (projectPathEditMode && projectPathInputRef.current) {
      projectPathInputRef.current.focus();
      projectPathInputRef.current.select();
    }
  }, [projectPathEditMode]);

  useEffect(() => {
    if (i18nPathEditMode && i18nPathInputRef.current) {
      i18nPathInputRef.current.focus();
      i18nPathInputRef.current.select();
    }
  }, [i18nPathEditMode]);

  if (!currentProject) return <></>;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Project path handlers
  const handleProjectPathEdit = () => {
    setTempProjectPath(currentProject.path);
    setProjectPathEditMode(true);
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
    setProjectPathEditMode(false);
    toast("success", {
      description: "Project folder location updated successfully",
    });
  };

  const handleProjectPathCancel = () => {
    setTempProjectPath("");
    setProjectPathEditMode(false);
  };

  const handleProjectPathKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleProjectPathSave();
    } else if (e.key === "Escape") {
      handleProjectPathCancel();
    }
  };

  // i18n path handlers
  const handleI18nPathEdit = () => {
    setTempI18nPath(currentProject.i18nPath);
    setI18nPathEditMode(true);
  };

  const handleI18nPathSave = () => {
    if (tempI18nPath.trim() === "") {
      toast.error("i18n path cannot be empty");
      return;
    }

    updateProject({
      ...currentProject,
      i18nPath: tempI18nPath.trim(),
    });
    setI18nPathEditMode(false);
    toast("success", {
      description: "i18n folder location updated successfully",
    });
  };

  const handleI18nPathCancel = () => {
    setTempI18nPath("");
    setI18nPathEditMode(false);
  };

  const handleI18nPathKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleI18nPathSave();
    } else if (e.key === "Escape") {
      handleI18nPathCancel();
    }
  };

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

  const handleDeleteProject = () => {
    removeCurrentProject();
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-6 py-8 max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <button
                className="p-2 border border-border rounded-md hover:bg-muted/50 transition-colors"
                onClick={toggle}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Project Settings</h1>
            </div>
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-200">
          <div className="space-y-6">
            {/* Project Folder Location */}
            <div className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg">
              <div
                className="p-6 cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
                onClick={() => toggleSection("project")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      Project Folder Location
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      The root directory of your project where all project files
                      are stored
                    </p>
                  </div>
                </div>
                {expandedSections.project ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {/* TODO: change this to browser path */}
              {expandedSections.project && (
                <div className="px-6 pb-6 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Current Project Path
                    </label>
                    <div className="flex items-center gap-3">
                      {projectPathEditMode ? (
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
                        {projectPathEditMode ? (
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

            {/* i18n Configuration */}
            <div className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg">
              <div
                className="p-6 cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
                onClick={() => toggleSection("i18n")}
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
                      Configure your translation files and language resources
                      directory
                    </p>
                  </div>
                </div>
                {expandedSections.i18n ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {expandedSections.i18n && (
                <div className="px-6 pb-6 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      i18n Folder Location
                    </label>
                    <div className="flex items-center gap-3">
                      {i18nPathEditMode ? (
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
                        {i18nPathEditMode ? (
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

            {/* Language Support Management */}
            <div className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg">
              <div
                className="p-6 cursor-pointer hover:bg-muted/20 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
                onClick={() => toggleSection("languages")}
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
                {expandedSections.languages ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              {expandedSections.languages && (
                <div className="px-6 pb-6 border-t border-border/50 space-y-6 animate-in fade-in slide-in-from-top duration-300">
                  <div className="mt-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Supported Languages
                    </h3>
                    <button
                      onClick={() => setShowLanguageDialog(true)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Language
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentProject.fileLanguageMap.map(
                      (fileLanguage, index) => (
                        <div
                          key={fileLanguage.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200 animate-in fade-in slide-in-from-left"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-1 border border-border rounded text-sm font-mono bg-background">
                              {fileLanguage.language}
                            </span>
                            <span className="font-medium">
                              {fileLanguage.filename}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleRemoveLanguage(fileLanguage.id)
                              }
                              className="p-1 rounded transition-colors text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-gradient-to-br from-red-50 to-red-50/50 backdrop-blur-sm shadow-xl border-red-200/50 dark:from-red-900/20 dark:to-red-900/10 dark:border-red-800/30 rounded-lg border">
              <div
                className="p-6 cursor-pointer hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors duration-200 rounded-t-lg flex items-center justify-between"
                onClick={() => toggleSection("danger")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                      Danger Zone
                    </h2>
                    <p className="text-sm text-red-600/80 dark:text-red-400/80">
                      Irreversible and destructive actions
                    </p>
                  </div>
                </div>
                {expandedSections.danger ? (
                  <ChevronDown className="h-5 w-5 text-red-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-red-500" />
                )}
              </div>

              {expandedSections.danger && (
                <div className="px-6 pb-6 border-t border-red-200 dark:border-red-800/30 space-y-4 animate-in fade-in slide-in-from-top duration-300">
                  <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                      Delete Project
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">
                      Permanently delete this project and all associated data.
                      This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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

      {/* Delete Project Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Project"
        message={`This will permanently delete "${currentProject.name}" and all associated data. This action cannot be undone.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteDialog(false)}
        type="danger"
        requiresTextConfirmation={true}
        confirmationText={currentProject.name}
      />
    </div>
  );
};
