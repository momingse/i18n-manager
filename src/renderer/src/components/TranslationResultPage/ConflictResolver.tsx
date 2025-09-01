import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Edit3,
  FileText,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";

export type Conflict = {
  key: string;
  language: string;
  originalValue: string;
  newValue: string;
};

type ResolveAction = "newValue" | "originalValue" | "useCustom";

type ConflictResolutionWithCustom = {
  key: string;
  language: string;
  action: "useCustom";
  customValue: string;
};

type ConflictResolutionWithOriginal = {
  key: string;
  language: string;
  action: "newValue" | "originalValue";
};

export type ConflictResolution =
  | ConflictResolutionWithCustom
  | ConflictResolutionWithOriginal;

interface ConflictResolverProps {
  conflicts: Conflict[];
  show: boolean;
  closeResolver: () => void;
  handleResolveConflict: (resolutions: ConflictResolution[]) => void;
}

export default function ConflictResolver({
  conflicts,
  show,
  closeResolver,
  handleResolveConflict: setConflictResolutions,
}: ConflictResolverProps) {
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [tempConflictResolutions, setTempConflictResolutions] = useState<
    ConflictResolution[]
  >([]);

  const handleConflictResolution = (resolutionAction: ResolveAction) => {
    const currentConflict = conflicts[currentConflictIndex];
    const existingResolution = tempConflictResolutions.find(
      (r) =>
        r.key === currentConflict.key &&
        r.language === currentConflict.language,
    );
    const resolution: ConflictResolution =
      resolutionAction === "useCustom"
        ? {
            key: currentConflict.key,
            language: currentConflict.language,
            action: "useCustom",
            customValue:
              existingResolution?.action === "useCustom"
                ? existingResolution.customValue
                : "",
          }
        : {
            key: currentConflict.key,
            language: currentConflict.language,
            action: resolutionAction,
          };

    setTempConflictResolutions((prev) => {
      const index = prev.findIndex(
        (r) =>
          r.key === currentConflict.key &&
          r.language === currentConflict.language,
      );

      if (index !== -1) {
        return [...prev.slice(0, index), resolution, ...prev.slice(index + 1)];
      }

      return [...prev, resolution];
    });
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomValue = e.target.value;
    const currentConflict = conflicts[currentConflictIndex];
    setTempConflictResolutions((prev) =>
      prev.map((r) => {
        if (
          r.key === currentConflict.key &&
          r.language === currentConflict.language
        ) {
          return {
            ...r,
            customValue: newCustomValue,
          };
        }
        return r;
      }),
    );
  };

  const handleFinishConflictResolution = () => {
    setConflictResolutions(tempConflictResolutions);
  };

  const handleNextConflict = () => {
    setCurrentConflictIndex((prev) => prev + 1);
  };

  const handlePreviousConflict = () => {
    setCurrentConflictIndex((prev) => prev - 1);
  };

  if (!show || !conflicts) return <></>;

  const isCurrentConflictResolved = tempConflictResolutions.some(
    (resolution) =>
      resolution.key === conflicts[currentConflictIndex].key &&
      resolution.language === conflicts[currentConflictIndex].language,
  );

  const currentResolution = tempConflictResolutions.find(
    (resolution) =>
      resolution.key === conflicts[currentConflictIndex].key &&
      resolution.language === conflicts[currentConflictIndex].language,
  );

  const allConflictsResolved =
    tempConflictResolutions.length === conflicts.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  Resolve Translation Conflicts
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                    {currentConflictIndex + 1} of {conflicts.length}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={closeResolver}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-muted-foreground mt-3">
            We found {conflicts.length} translation key
            {conflicts.length !== 1 ? "s" : ""} that already exist in your
            project with different values. Please choose how to resolve each
            conflict.
          </p>
        </div>

        {conflicts.length > 0 && (
          <div className="p-6 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="font-medium">Progress</span>
                <span>
                  {tempConflictResolutions.length}/{conflicts.length} resolved
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(tempConflictResolutions.length / conflicts.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Current Conflict */}
            <div className="border-2 backdrop-blur-sm rounded-lg shadow-lg">
              <div className="p-4 border-b border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-base">
                        {conflicts[currentConflictIndex]?.language}
                      </div>
                      <code className="text-sm font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        {conflicts[currentConflictIndex]?.key}
                      </code>
                    </div>
                  </div>
                  {isCurrentConflictResolved && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-700 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Resolved
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Original vs New Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground">
                      Current Value (in project)
                    </label>
                    <div className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/20 rounded-lg">
                      <p className="text-sm font-mono break-words">
                        "{conflicts[currentConflictIndex]?.originalValue}"
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-muted-foreground">
                      New Translation
                    </label>
                    <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-2 border-green-500/20 rounded-lg">
                      <p className="text-sm font-mono break-words">
                        "{conflicts[currentConflictIndex]?.newValue}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resolution Options */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-muted-foreground">
                    Choose resolution:
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleConflictResolution("originalValue")}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-md",
                        currentResolution?.action === "originalValue"
                          ? "border-destructive/30 bg-gradient-to-br from-destructive/10 to-destructive/5 shadow-lg"
                          : "border-border hover:border-destructive/30 hover:bg-gradient-to-br hover:from-destructive/10 hover:to-destructive/5",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/10 flex items-center justify-center">
                          <RotateCcw className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <div className="font-semibold">Keep Original</div>
                          <div className="text-sm text-muted-foreground">
                            Keep the existing value in your project
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleConflictResolution("newValue")}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-md",
                        currentResolution?.action === "newValue"
                          ? "border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-lg"
                          : "border-border hover:border-green-500/30 hover:bg-gradient-to-br hover:from-green-500/10 hover:to-green-500/5",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            Use New Translation
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Replace with the new translated value
                          </div>
                        </div>
                      </div>
                    </button>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleConflictResolution("useCustom")}
                        className={cn(
                          "w-full p-4 rounded-lg border-2 transition-all text-left hover:shadow-md",
                          currentResolution?.action === "useCustom"
                            ? "border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg"
                            : "border-border hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                            <Edit3 className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">
                              Use Custom Value
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Enter your own translation
                            </div>
                          </div>
                        </div>
                      </button>

                      {currentResolution?.action === "useCustom" && (
                        <input
                          placeholder="Enter custom translation..."
                          value={currentResolution?.customValue}
                          onChange={handleCustomValueChange}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background transition-colors"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousConflict}
                disabled={currentConflictIndex === 0}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {conflicts.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentConflictIndex
                        ? "bg-primary scale-125"
                        : tempConflictResolutions.some(
                              (r) =>
                                r.key === conflicts[index].key &&
                                r.language === conflicts[index].language,
                            )
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextConflict}
                disabled={currentConflictIndex === conflicts.length - 1}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-border bg-gradient-to-br from-muted/30 to-muted/10 flex justify-end gap-3">
          <button
            onClick={closeResolver}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleFinishConflictResolution}
            disabled={!allConflictsResolved}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-lg disabled:opacity-50 flex items-center gap-2 font-medium transition-all shadow-lg hover:shadow-xl"
          >
            <Save className="w-4 h-4" />
            Save with Resolutions
          </button>
        </div>
      </div>
    </div>
  );
}
