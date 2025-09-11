import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, FolderPlus } from "lucide-react";

interface ProjectNameStepProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onNext: () => void;
}

export function ProjectNameStep({
  projectName,
  onProjectNameChange,
  onNext,
}: ProjectNameStepProps) {
  return (
    <>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-primary" />
          Project Name
        </CardTitle>
        <CardDescription>
          What would you like to call your project?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="project-name" className="text-sm font-medium">
            Project Name *
          </Label>
          <Input
            id="project-name"
            placeholder="My Awesome App"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="mt-2 h-11 bg-muted/50 border-0 focus:bg-muted/70 transition-colors duration-200"
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button
            onClick={onNext}
            disabled={!projectName.trim()}
            className="px-6 h-10 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}
