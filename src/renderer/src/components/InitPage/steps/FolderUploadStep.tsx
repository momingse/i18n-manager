import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowRight, FolderOpen, Upload } from "lucide-react";

interface FolderUploadStepProps {
  projectPath?: string;
  onFolderChange: (filePath: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FolderUploadStep({
  projectPath: selectedFolder,
  onFolderChange,
  onNext,
  onPrev,
}: FolderUploadStepProps) {
  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      onFolderChange("");
      return;
    }

    const folderPath = files[0].path.split("/").slice(0, -1).join("/");
    onFolderChange(folderPath);
  };

  const folderName = selectedFolder?.split("/").pop() || "";

  return (
    <>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          Upload Project Folder
        </CardTitle>
        <CardDescription>Select your entire project directory</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="project-folder" className="text-sm font-medium">
            Project Folder *
          </Label>
          <div className="mt-2">
            <div className="relative">
              <input
                id="project-folder"
                type="file"
                onChange={handleFolderSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                webkitdirectory="true"
                /* eslint-disable-next-line react/no-unknown-property */
                directory="true"
                multiple
              />
              <div className="h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-colors duration-200">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center px-4">
                  {selectedFolder ? (
                    <span className="text-primary font-medium">
                      You selected: {folderName}
                    </span>
                  ) : (
                    "Click to select your project folder"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            onClick={onPrev}
            className="px-4 h-10 bg-transparent"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!selectedFolder}
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
