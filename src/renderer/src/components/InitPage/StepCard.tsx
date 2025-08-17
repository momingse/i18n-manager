import { Card } from "@/components/ui/card";
import { FolderUploadStep } from "./steps/FolderUploadStep";
import { I18nConfigStep } from "./steps/I18nConfigStep";
import { ProjectNameStep } from "./steps/ProjectNameStep";
import { DetectedLanguage, ProjectData } from "@/pages/Init";

interface StepCardProps {
  step: number;
  projectData: ProjectData;
  setProjectData: React.Dispatch<React.SetStateAction<ProjectData>>;
  detectedLanguages: DetectedLanguage[];
  setDetectedLanguages: React.Dispatch<
    React.SetStateAction<DetectedLanguage[]>
  >;
  isCreating: boolean;
  onNext: () => void;
  onPrev: () => void;
  onCreateProject: () => void;
}

export function StepCard({
  step,
  projectData,
  setProjectData,
  detectedLanguages,
  setDetectedLanguages,
  isCreating,
  onNext,
  onPrev,
  onCreateProject,
}: StepCardProps) {
  return (
    <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-2xl animate-in fade-in slide-in-from-bottom duration-700">
      {step === 1 && (
        <ProjectNameStep
          projectName={projectData.name}
          onProjectNameChange={(name) =>
            setProjectData((prev) => ({ ...prev, name }))
          }
          onNext={onNext}
        />
      )}

      {step === 2 && (
        <FolderUploadStep
          projectPath={projectData.projectPath}
          onFolderChange={(selectFolder) =>
            setProjectData((prev) => ({ ...prev, projectPath: selectFolder }))
          }
          onNext={onNext}
          onPrev={onPrev}
        />
      )}

      {step === 3 && (
        <I18nConfigStep
          i18nPath={projectData.i18nPath}
          onI18nPathChange={(path) =>
            setProjectData((prev) => ({ ...prev, i18nPath: path }))
          }
          detectedLanguages={detectedLanguages}
          setDetectedLanguages={setDetectedLanguages}
          isCreating={isCreating}
          onPrev={onPrev}
          onCreateProject={onCreateProject}
        />
      )}
    </Card>
  );
}

