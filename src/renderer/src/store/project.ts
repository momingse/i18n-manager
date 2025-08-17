import { jsonStorage } from "@/lib/electronStore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type i18nLanguage = {
  id: string;
  filename: string;
  language: string;
};

export type Project = {
  id: string;
  name: string;
  path: string;
  i18nPath: string;
  fileLanguageMap: i18nLanguage[];
  createdAt: Date;
  updatedAt: Date;
  translationCount: number;
  data: Record<string, Record<string, string>>;
};

type ProjectStoreState = {
  currentProjectId: string | null;
  projects: Record<string, Project>;
};

type ProjectStoreActions = {
  createProject: (
    projectName: string,
    path: string,
    i18nPath: string,
    fileLanguageMap: i18nLanguage[],
    data?: Record<string, Record<string, string>>,
  ) => void;
  switchProject: (projectId: string) => void;
  updateProject: (project: Project) => void;
  addLanguage: (language: i18nLanguage) => void;
  removeLanguage: (languageId: string) => void;
};

type ProjectStore = ProjectStoreState & ProjectStoreActions;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProjectId: null,
      projects: {},
      createProject: (projectName, path, i18nPath, fileLanguageMap, data) => {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name: projectName,
          path,
          i18nPath,
          fileLanguageMap,
          createdAt: new Date(),
          updatedAt: new Date(),
          translationCount: 0,
          data: data || {},
        };
        set((state) => ({
          ...state,
          currentProjectId: newProject.id,
          projects: {
            ...state.projects,
            [newProject.id]: newProject,
          },
        }));
      },
      switchProject: (projectId) => {
        set((state) => ({
          currentProjectId: state.projects[projectId] ? projectId : null,
        }));
      },
      updateProject: (project) => {
        set((state) => ({
          projects: {
            ...state.projects,
            [project.id]: project,
          },
          currentProjectId:
            state.currentProjectId === project.id
              ? project.id
              : state.currentProjectId,
        }));
      },
      addLanguage: (i18nLanguage) => {
        set((state) => {
          const currectProject = state.projects[state.currentProjectId ?? ""];
          if (!currectProject) return state;
          const updatedCurrentProject: Project = {
            ...currectProject,
            fileLanguageMap: [...currectProject.fileLanguageMap, i18nLanguage],
          };

          return {
            projects: {
              ...state.projects,
              [updatedCurrentProject.id]: updatedCurrentProject,
            },
            currentProjectId: updatedCurrentProject.id,
          };
        });
      },
      removeLanguage: (language) => {
        set((state) => {
          const currentProject = state.projects[state.currentProjectId ?? ""];
          if (!currentProject) return state;
          const updatedCurrentProjectfileLanguageMap =
            currentProject.fileLanguageMap.filter(
              (lang) => lang.id !== language,
            );
          const updatedCurrentProject: Project = {
            ...currentProject,
            fileLanguageMap: updatedCurrentProjectfileLanguageMap,
          };
          return {
            projects: {
              ...state.projects,
              [updatedCurrentProject.id]: updatedCurrentProject,
            },
            currentProjectId: updatedCurrentProject.id,
          };
        });
      },
    }),
    {
      name: "project-storage",
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
        projects: state.projects,
      }),
      storage: createJSONStorage(() => jsonStorage),
    },
  ),
);
