import { PageHeader } from "@/components/InitPage/PageHeader";
import { ProgressSteps } from "@/components/InitPage/ProgressSteps";
import { StepCard } from "@/components/InitPage/StepCard";
import { i18nLanguage, useProjectStore } from "@/store/project";
import { useState } from "react";

export interface ProjectData {
  name: string;
  projectPath?: string;
  i18nPath: string;
}

export default function InitPage() {
  const { createProject } = useProjectStore();
  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const [projectData, setProjectData] = useState<ProjectData>({
    name: "",
    i18nPath: "",
  });

  const [detectedLanguages, setDetectedLanguages] = useState<i18nLanguage[]>(
    [],
  );

  const handleCreateProject = async () => {
    if (
      !projectData.name.trim() ||
      !projectData.projectPath ||
      !projectData.i18nPath.trim()
    )
      return;

    setIsCreating(true);

    createProject(
      projectData.name,
      projectData.projectPath,
      projectData.i18nPath,
      detectedLanguages.map<i18nLanguage>((lang) => ({
        ...lang,
        filename: `${lang.filename}.json`,
      })),
    );
  };

  const checkForExistingJsonFiles = () => {
    // TODO: check for existing json files
  };

  const nextStep = () => {
    if (step === 2) {
      setTimeout(() => checkForExistingJsonFiles(), 100);
    }
    setStep(Math.min(step + 1, 3));
  };

  const prevStep = () => setStep(Math.max(step - 1, 1));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <PageHeader />
        <ProgressSteps currentStep={step} />
        <StepCard
          step={step}
          projectData={projectData}
          setProjectData={setProjectData}
          detectedLanguages={detectedLanguages}
          setDetectedLanguages={setDetectedLanguages}
          isCreating={isCreating}
          onNext={nextStep}
          onPrev={prevStep}
          onCreateProject={handleCreateProject}
        />
      </div>
    </div>
  );
}
