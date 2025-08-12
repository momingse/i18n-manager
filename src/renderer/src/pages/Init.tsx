import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMMON_LANGUAGES } from "@/constants/constants";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project";
import {
  ArrowRight,
  CheckCircle,
  FolderPlus,
  Languages,
  Rocket,
} from "lucide-react";
import { useState } from "react";

export default function InitPage() {
  const { createProject } = useProjectStore();
  const [step, setStep] = useState(1);

  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    languages: ["en"],
  });

  const handleLanguageToggle = (langCode: string) => {
    if (langCode === "en") return; // English is always required

    setProjectData((prev) => ({
      ...prev,
      languages: prev.languages.includes(langCode)
        ? prev.languages.filter((l) => l !== langCode)
        : [...prev.languages, langCode],
    }));
  };

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) return;

    createProject(
      projectData.name,
      projectData.description,
      projectData.languages,
    );
  };

  const nextStep = () => setStep(Math.min(step + 1, 2));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-600">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome to i18n Manager
          </h1>
          <p className="text-lg text-muted-foreground">
            Let's create your first translation project
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    stepNum <= step
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {stepNum < step ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 2 && (
                  <div
                    className={cn(
                      "w-12 h-0.5 mx-2 transition-all duration-300",
                      stepNum < step ? "bg-primary" : "bg-muted",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
          {step === 1 && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                  <FolderPlus className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Project Details</CardTitle>
                <CardDescription className="text-base">
                  Give your translation project a name and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label
                    htmlFor="project-name"
                    className="text-base font-medium"
                  >
                    Project Name *
                  </Label>
                  <Input
                    id="project-name"
                    placeholder="My Awesome App"
                    value={projectData.name}
                    onChange={(e) =>
                      setProjectData({ ...projectData, name: e.target.value })
                    }
                    className="mt-2 h-12 text-base bg-muted/50 border-0 focus:bg-muted/70 transition-colors duration-200"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="project-description"
                    className="text-base font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="project-description"
                    placeholder="A brief description of your project and its translation needs..."
                    value={projectData.description}
                    onChange={(e) =>
                      setProjectData({
                        ...projectData,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="mt-2 text-base bg-muted/50 border-0 focus:bg-muted/70 transition-colors duration-200 resize-none"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={nextStep}
                    disabled={!projectData.name.trim()}
                    className="px-8 h-12 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center pb-6">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                  <Languages className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Choose Languages</CardTitle>
                <CardDescription className="text-base">
                  Select the languages you want to support in your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">
                    Selected Languages ({projectData.languages.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {COMMON_LANGUAGES.map((lang) => {
                    const isSelected = projectData.languages.includes(
                      lang.code,
                    );
                    const isRequired = lang.code === "en";

                    return (
                      <div
                        key={lang.code}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:shadow-md",
                          isSelected
                            ? "border-primary/50 bg-primary/5 shadow-sm"
                            : "border-muted hover:border-primary/30 hover:bg-muted/50",
                          isRequired && "opacity-75 cursor-not-allowed",
                        )}
                        onClick={() =>
                          !isRequired && handleLanguageToggle(lang.code)
                        }
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isRequired}
                          onCheckedChange={() =>
                            !isRequired && handleLanguageToggle(lang.code)
                          }
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-lg">{lang.flag}</span>
                          <span className="font-medium truncate">
                            {lang.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({lang.code})
                          </span>

                          {isRequired && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-muted"
                            >
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="px-6 h-12 bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={projectData.languages.length < 2}
                    className="px-8 h-12 text-base bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                  >
                    <Rocket className="w-4 h-4" />
                    Create Project
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            You can always change these settings later in your project
            configuration
          </p>
        </div>
      </div>
    </div>
  );
}
