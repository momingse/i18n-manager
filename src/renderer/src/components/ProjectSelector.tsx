import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project";
import { ChevronDown, FileText, FolderOpen, Globe, Plus } from "lucide-react";
import { useState } from "react";

interface ProjectSelectorProps {
  isOpen: boolean;
}

export function ProjectSelector({ isOpen }: ProjectSelectorProps) {
  const { currentProjectId, projects, switchProject, unsetCurrentProject } =
    useProjectStore();

  if (!currentProjectId) return null;

  const currentProject = projects[currentProjectId];
  const currentProjectFolderName = currentProject.path.split("/").pop();

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between hover:bg-primary/10 transition-colors duration-200 p-3 h-auto"
            >
              {!isOpen ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 m-auto">
                    <FolderOpen className="w-4 h-4 text-primary" />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0">
                      <FolderOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {currentProject.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {currentProject.fileLanguageMap.length} languages
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </>
              )}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="start">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              CURRENT PROJECT
            </div>
            <div className="p-3 bg-muted/50 rounded-lg mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{currentProject.name}</div>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {currentProjectFolderName}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {currentProject.fileLanguageMap.length}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {currentProject.translationCount}
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          {projects && Object.keys(projects).length > 1 && (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                ALL PROJECTS
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {Object.values(projects)
                  ?.filter((p) => p.id !== currentProjectId)
                  .map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => switchProject(project.id)}
                      className={cn(
                        "cursor-pointer p-3 rounded-lg",
                        project.id === currentProject.id && "bg-primary/10",
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-6 h-6 rounded bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <FolderOpen className="w-3 h-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {project.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {project.fileLanguageMap.length} languages •{" "}
                            {project.translationCount} keys
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className="w-full"
            onClick={unsetCurrentProject}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
