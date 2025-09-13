import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMMON_LANGUAGES } from "@/constants/constants";
import { i18nLanguage, ProjectFile } from "@/store/project";
import { AlertCircle, FileText, Plus, X } from "lucide-react";
import { useState } from "react";
import { InputWithDropdown } from "../InputWithDropdownProps";

interface LanguageManagerProps {
  disabled: boolean;
  availableJsonFiles: ProjectFile[];
  detectedLanguages: i18nLanguage[];
  setDetectedLanguages: React.Dispatch<React.SetStateAction<i18nLanguage[]>>;
}

export const LanguageManager = ({
  disabled,
  availableJsonFiles,
  detectedLanguages,
  setDetectedLanguages,
}: LanguageManagerProps) => {
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  // Check if current combination already exists
  const combinationExists = detectedLanguages.some(
    (lang) => lang.filename === selectedFile.replace(".json", ""),
  );

  // Check if the selected file exists in available files
  const fileExists = availableJsonFiles.some(
    (file) =>
      file.name === selectedFile || file.name === `${selectedFile}.json`,
  );

  const addLanguageMapping = () => {
    if (!selectedFile || !selectedLanguage) return;

    const fileName = selectedFile.replace(".json", "");

    const newLang: i18nLanguage = {
      id: crypto.randomUUID(),
      filename: fileName,
      language: selectedLanguage,
    };

    setDetectedLanguages((prev) => [...prev, newLang]);

    // Reset form
    setSelectedFile("");
    setSelectedLanguage("");
  };

  const removeLanguage = (id: string) => {
    setDetectedLanguages(detectedLanguages.filter((lang) => lang.id !== id));
  };

  const updateLanguage = (
    id: string,
    field: "filename" | "language",
    value: string,
  ) => {
    setDetectedLanguages(
      detectedLanguages.map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang,
      ),
    );
  };

  if (disabled) {
    return (
      <div className="border border-dashed border-border/50 rounded-lg p-6 bg-muted/10 text-center">
        <p className="text-sm text-muted-foreground">
          Please select a project folder first
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Language File Mapping */}
      <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-card">
        <Label className="text-sm font-medium">Add Language File</Label>

        {/* File Selection */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Language File *
          </Label>
          <InputWithDropdown
            value={selectedFile}
            onChange={setSelectedFile}
            items={availableJsonFiles.map((file) => ({
              value: file.name,
              label: file.name,
              description: file.path,
            }))}
            placeholder="Type or select a file name (e.g., en.json)"
            className="h-9 text-sm"
            dropdownClassName="max-h-48 overflow-y-auto"
          />

          {/* File doesn't exist indicator */}
          {selectedFile && !fileExists && (
            <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
              <FileText className="w-3 h-3" />
              <span>
                This file does not exist and will be created with the project
              </span>
            </div>
          )}
        </div>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Language *</Label>
          <InputWithDropdown
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            items={COMMON_LANGUAGES.map((language) => ({
              value: language.name,
              label: language.name,
            }))}
            placeholder="Type or select a language..."
            className="h-8 text-sm"
            dropdownClassName="overflow-scroll max-h-48"
          />
        </div>

        {/* Add Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={addLanguageMapping}
            disabled={!selectedFile || !selectedLanguage || combinationExists}
            className="h-9 px-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Language File
          </Button>

          {combinationExists && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="w-3 h-3" />
              <span>This file is already configured</span>
            </div>
          )}
        </div>
      </div>

      {/* Configured Language Files */}
      {detectedLanguages.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Configured Languages ({detectedLanguages.length})
          </Label>
          <div className="space-y-2 max-h-64">
            {detectedLanguages.map((lang) => (
              <div
                key={lang.id}
                className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border/30 shadow-sm"
              >
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Filename
                    </Label>
                    <div className="flex items-center gap-1">
                      <Input
                        value={lang.filename}
                        onChange={(e) =>
                          updateLanguage(lang.id, "filename", e.target.value)
                        }
                        className="h-8 text-sm bg-background/80 border-border/50"
                        placeholder="en"
                      />
                      <span className="text-xs text-muted-foreground">
                        .json
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Language *
                    </Label>
                    <InputWithDropdown
                      value={lang.language}
                      onChange={(value) =>
                        updateLanguage(lang.id, "language", value)
                      }
                      placeholder="Language for this file..."
                      items={COMMON_LANGUAGES.map((l) => ({
                        value: l.name,
                        label: l.name,
                      }))}
                      className="h-8 text-sm bg-background/80 border-border/50"
                      dropdownClassName="overflow-scroll max-h-40"
                    />
                  </div>
                </div>
                <div className="pt-5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(lang.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {availableJsonFiles.length === 0 && detectedLanguages.length === 0 && (
        <div className="border border-dashed border-border/50 rounded-lg p-6 bg-muted/10 text-center">
          <p className="text-sm text-muted-foreground">
            No JSON files found in the i18n directory
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You can still create new language files using the form above
          </p>
        </div>
      )}
    </div>
  );
};
