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
  removeTranslationByKey: (key: string) => void;
  updateTranslationKey: (oldKey: string, newKey: string) => void;
  addTranslationKey: (key: string) => void;
  updateTranslation: (language: string, key: string, value: string) => void;
  updateData: (data: Record<string, Record<string, string>>) => void;
  fetchProjectFiles: () => Promise<void>;
};

type ProjectStore = ProjectStoreState & ProjectStoreActions;

type ProjectSelector<T> = (state: ProjectStore) => T;

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

      removeTranslationByKey: (key) => {
        set((state) => {
          const currentProject = state.projects[state.currentProjectId ?? ""];
          if (!currentProject) return state;

          const updatedData = { ...currentProject.data };
          for (const lang in updatedData) {
            if (Object.prototype.hasOwnProperty.call(updatedData, lang)) {
              delete updatedData[lang][key];
            }
          }

          const updatedCurrentProject: Project = {
            ...currentProject,
            data: {
              ...updatedData,
            },
          };
          return {
            projects: {
              ...state.projects,
              [updatedCurrentProject.id]: updatedCurrentProject,
            },
          };
        });
      },

      updateTranslationKey: (oldKey, newKey) => {
        set((state) => {
          const currentProject = state.projects[state.currentProjectId ?? ""];
          if (!currentProject) return state;

          const updatedData = { ...currentProject.data };
          for (const lang in updatedData) {
            if (Object.prototype.hasOwnProperty.call(updatedData, lang)) {
              updatedData[lang][newKey] = updatedData[lang][oldKey];
              delete updatedData[lang][oldKey];
            }
          }

          const updatedCurrentProject: Project = {
            ...currentProject,
            data: {
              ...updatedData,
            },
          };
          return {
            projects: {
              ...state.projects,
              [updatedCurrentProject.id]: updatedCurrentProject,
            },
          };
        });
      },

      addTranslationKey: (key) => {
        set((state) => {
          const currentProject = state.projects[state.currentProjectId ?? ""];
          if (!currentProject) return state;

          const updatedData = { ...currentProject.data };
          for (const lang in updatedData) {
            if (Object.prototype.hasOwnProperty.call(updatedData, lang)) {
              updatedData[lang][key] = "";
            }
          }

          const updatedCurrentProject: Project = {
            ...currentProject,
            data: {
              ...updatedData,
            },
          };
          return {
            projects: {
              ...state.projects,
              [updatedCurrentProject.id]: updatedCurrentProject,
            },
          };
        });
      },

      updateTranslation: (language, key, value) => {
        set((state) => {
          const currentProject = state.projects[state.currentProjectId ?? ""];
          if (!currentProject) return state;

          const updatedData = { ...currentProject.data };
          updatedData[language][key] = value;
          const updatedCurrentProject: Project = {
            ...currentProject,
            data: updatedData,
          };
          return {
            projects: {
              ...state.projects,
              [updatedCurrentProject.id]: updatedCurrentProject,
            },
          };
        });
      },

      updateData: (data) => {
        set((state) => {
          const currentProject = state.projects[state.currentProjectId ?? ""];
          if (!currentProject) return state;

          const mergedData = { ...currentProject.data };
          for (const lang in data) {
            if (Object.prototype.hasOwnProperty.call(data, lang)) {
              mergedData[lang] = { ...(mergedData[lang] || {}), ...data[lang] };
            }
          }
          const updatedCurrentProject: Project = {
            ...currentProject,
            data: mergedData,
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
          const files = await window.electronAPI.readFiles.readProjectFiles(
            currentProject.path,
          );
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

export const currentProjectSelector: ProjectSelector<Project | null> = (
  state,
) =>
  state.currentProjectId
    ? (state.projects[state.currentProjectId] ?? null)
    : null;

export const currentProjectLanguageSelector: ProjectSelector<string[]> = (
  state,
) =>
  state.currentProjectId
    ? (state.projects[state.currentProjectId]?.fileLanguageMap.map(
        (lang) => lang.language,
      ) ?? [])
    : [];
