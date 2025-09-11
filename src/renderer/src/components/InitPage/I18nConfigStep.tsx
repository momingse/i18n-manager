import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Globe, Rocket } from "lucide-react";
import { LanguageManager } from "./LanguageManager";
import { PathInput } from "./PathInput";
import { i18nLanguage } from "@/store/project";

interface I18nConfigStepProps {
  i18nPath: string;
  onI18nPathChange: (path: string) => void;
  detectedLanguages: i18nLanguage[];
  setDetectedLanguages: React.Dispatch<React.SetStateAction<i18nLanguage[]>>;
  isCreating: boolean;
  onPrev: () => void;
  onCreateProject: () => void;
}

export function I18nConfigStep({
  i18nPath,
  onI18nPathChange,
  detectedLanguages,
  setDetectedLanguages,
  isCreating,
  onPrev,
  onCreateProject,
}: I18nConfigStepProps) {
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
        <div className="relative">
          <Label htmlFor="i18n-path" className="text-sm font-medium">
            i18n Directory Path *
          </Label>
          <PathInput
            value={i18nPath}
            onChange={onI18nPathChange}
            placeholder="./locales"
          />
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

