import I18nConfigurePanel from "@/components/SettingPage/I18nConfigurePanel";
import LanguageSupportManagementPanel from "@/components/SettingPage/LanguageSupportManagementPanel";
import { LLMConfigurePanel } from "@/components/SettingPage/LLMConfigurePanel";
import ProjectFolderConfigurePanel from "@/components/SettingPage/ProjectFolderConfigurePanel";
import { ConfirmationDialog } from "@/components/SettingPage/RemoveProjectConfirmationDialog";
import { useProjectStore } from "@/store/project";
import { useSidebarStore } from "@/store/sidebar";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Menu,
  Settings,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";

export const SettingsPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState({
    danger: false,
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { toggle } = useSidebarStore();
  const { currentProjectId, projects, removeCurrentProject } =
    useProjectStore();
  const currentProject = projects[currentProjectId ?? ""];

  if (!currentProject) return <></>;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
            {/* Project Configuration */}
            <ProjectFolderConfigurePanel />

            {/* i18n Configuration */}
            <I18nConfigurePanel />

            {/* Language Support Management */}
            <LanguageSupportManagementPanel />

            {/* LLM API Configuration - Now a self-contained component */}
            <LLMConfigurePanel />

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
