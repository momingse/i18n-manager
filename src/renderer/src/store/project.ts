import { jsonStorage } from "@/lib/electronStore";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type i18nLanguage = {
  id: string;
  filename: string;
  language: string;
};

export type ProjectFile = {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
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
  files: ProjectFile[];
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
  removeCurrentProject: () => void;
  removeLanguage: (languageId: string) => void;
  fetchProjectFiles: () => Promise<void>;
};

type ProjectStore = ProjectStoreState & ProjectStoreActions;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentProjectId: null,
      projects: {},
      files: [],

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

      removeCurrentProject: () => {
        set((state) => {
          if (!state.currentProjectId) return state;

          // remove current project
          const updatedProjects = { ...state.projects };
          delete updatedProjects[state.currentProjectId];

          // check if there is another project, if yes, set it as current
          return {
            currentProjectId: Object.keys(updatedProjects)[0] || null,
            projects: updatedProjects,
          };
        });
      },

      removeLanguage: (languageId) => {
        set((state) => {
          const currentProject = state.projects[state.currentProjectId ?? ""];
          if (!currentProject) return state;
          const updatedCurrentProject: Project = {
            ...currentProject,
            fileLanguageMap: currentProject.fileLanguageMap.filter(
              (lang) => lang.id !== languageId,
            ),
          };
          return {
            projects: {
              ...state.projects,
              [updatedCurrentProject.id]: updatedCurrentProject,
            },
          };
        });
      },

      fetchProjectFiles: async () => {
        const currentProject = get().projects[get().currentProjectId ?? ""];
        if (!currentProject) {
          set({ files: [] });
          return;
        }
        try {
          const files =
            (await window.ipcRenderer.invoke(
              "readFiles:read-project-files",
              currentProject.path,
            )) || [];
          set({ files });
        } catch (error) {
          console.error("Failed to fetch project files:", error);
          set({ files: [] });
        }
      },
    }),
    {
      name: "project-storage",
      partialize: (state) => ({
        currentProjectId: state.currentProjectId,
        projects: state.projects,
      }),
      storage: createJSONStorage(() => jsonStorage),
      onRehydrateStorage: () => async (state) => {
        if (!state || !state.currentProjectId || !state.projects) return;
        await state.fetchProjectFiles();
      },
    },
  ),
);
