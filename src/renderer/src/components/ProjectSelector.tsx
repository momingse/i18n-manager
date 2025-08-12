import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project";
import { useSidebarStore } from "@/store/sidebar";
import { ChevronDown, FileText, FolderOpen, Globe, Plus } from "lucide-react";
import { useState } from "react";

interface ProjectSelectorProps {
  isOpen: boolean;
}

export function ProjectSelector({ isOpen }: ProjectSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    languages: ["en"],
  });

  const { currentProject, projects, switchProject, createProject } =
    useProjectStore();

  const handleCreateProject = () => {
    if (!newProject.name.trim()) return;

    createProject(
      newProject.name,
      newProject.description,
      newProject.languages,
    );

    setIsCreateDialogOpen(false);
  };

  if (!currentProject) return null;

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
                        {currentProject.languages.length} languages
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
                {currentProject.description || "No description"}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {currentProject.languages.length}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {currentProject.translationCount}
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              ALL PROJECTS
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {projects.map((project) => (
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
                      <div className="font-medium truncate">{project.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {project.languages.length} languages •{" "}
                        {project.translationCount} keys
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Project
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new translation project with its own settings and
                  data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="My Translation Project"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    placeholder="Brief description of this project..."
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProject.name.trim()}
                    className="flex-1"
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
