import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { i18nLanguage, ProjectFile } from "@/store/project";
import { Globe, Loader2, Rocket, RotateCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { LanguageManager } from "./LanguageManager";
import { PathInput } from "./PathInput";
import path from "path-browserify";

interface I18nConfigStepProps {
  projectPath?: string;
  i18nPath: string;
  onI18nPathChange: (path: string) => void;
  detectedLanguages: i18nLanguage[];
  setDetectedLanguages: React.Dispatch<React.SetStateAction<i18nLanguage[]>>;
  isCreating: boolean;
  onPrev: () => void;
  onCreateProject: () => void;
}

export function I18nConfigStep({
  projectPath,
  i18nPath,
  onI18nPathChange,
  detectedLanguages,
  setDetectedLanguages,
  isCreating,
  onPrev,
  onCreateProject,
}: I18nConfigStepProps) {
  const [availableFolders, setAvailableFolders] = useState<ProjectFile[]>([]);
  const [availableJsonFiles, setAvailableJsonFiles] = useState<ProjectFile[]>(
    [],
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAvailableFolders = useCallback(async () => {
    if (!projectPath) return;
    try {
      setIsRefreshing(true);
      const folders =
        await window.electronAPI.fileManager.readProjectFolders(projectPath);
      setAvailableFolders(folders);
    } catch (err) {
      // optionally surface error to user with a toast
      console.error("Failed to read project folders", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [projectPath]);

  const fetchAllJsonFile = useCallback(async () => {
    if (!projectPath || !i18nPath) return;

    const fullI18nPath = path.join(i18nPath);
    try {
      const files =
        await window.electronAPI.fileManager.readProjectFiles(fullI18nPath);
      const jsonFiles = files.filter((file) => file.name.endsWith(".json"));
      setAvailableJsonFiles(jsonFiles);
    } catch (err) {
      // optionally surface error to user with a toast
      console.error("Failed to read project files", err);
    }
  }, [projectPath, i18nPath]);

  useEffect(() => {
    fetchAvailableFolders();
    fetchAllJsonFile();
  }, [fetchAvailableFolders, fetchAllJsonFile]);

  return (
    <>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          i18n Configuration
        </CardTitle>
        <CardDescription>
          Configure your translation files location and languages
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="i18n-path" className="text-sm font-medium">
              i18n Directory Path *
            </Label>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchAvailableFolders}
                disabled={!projectPath || isRefreshing}
                className="h-8 px-2"
                aria-label="Refresh folders"
                title={projectPath ? "Refresh folders" : "Open a project first"}
              >
                {isRefreshing ? (
                  <Loader2
                    className={`w-4 h-4 transition-transform ${isRefreshing ? "animate-spin" : ""}`}
                  />
                ) : (
                  <RotateCw
                    className={`w-4 h-4 transition-transform ${isRefreshing ? "animate-spin" : ""}`}
                  />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-2">
            <PathInput
              value={i18nPath}
              onChange={onI18nPathChange}
              placeholder="Enter the path to your i18n directory"
              availableFolders={availableFolders}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Language Files</Label>
            {detectedLanguages.length === 0 && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                No JSON files detected
              </span>
            )}
          </div>

          <LanguageManager
            disabled={!i18nPath}
            availableJsonFiles={availableJsonFiles}
            detectedLanguages={detectedLanguages}
            setDetectedLanguages={setDetectedLanguages}
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrev}
            className="px-4 h-10 bg-transparent"
          >
            Back
          </Button>

          <Button
            onClick={onCreateProject}
            disabled={
              isCreating || !i18nPath.trim() || detectedLanguages.length === 0
            }
            className="px-6 h-10 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Create Project
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
