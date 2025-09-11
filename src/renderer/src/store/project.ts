import { deepClone } from "@/lib/deepClone";
import { jsonStorage } from "@/lib/electronStore";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from "zustand/middleware";
import createDeepMerge from "@fastify/deepmerge";

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

type UndoableStack<T> = {
  redoStack: T[];
  undoStack: T[];
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
  undoableStack: UndoableStack<Record<string, Record<string, string>>>;
};

type ProjectStoreState = {
  currentProjectId?: string;
  projects: Record<string, Project>;
  currentProjectFiles: ProjectFile[];
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
  undoTranslation: () => void;
  redoTranslation: () => void;
  updateData: (data: Record<string, Record<string, string>>) => void;
  fetchProjectFiles: () => Promise<void>;
};

type ProjectStore = ProjectStoreState & ProjectStoreActions;

type ProjectSelector<T> = (state: ProjectStore) => T;

const UNDO_LIMIT = 50;

const deepMerge = createDeepMerge({ all: true });

const limitStackSize = <T>(stack: T[], limit: number = UNDO_LIMIT): T[] => {
  if (stack.length <= limit) return stack;
  return stack.slice(-limit); // Keep only the last 'limit' items
};

const addToUndoStack = <T>(undoStack: T[], item: T, limit?: number): T[] => {
  const newStack = [...undoStack, item];
  return limitStackSize(newStack, limit);
};

export const useProjectStore = create<ProjectStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        projects: {},
        currentProjectFiles: [],

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
            undoableStack: {
              redoStack: [],
              undoStack: [],
            },
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
            currentProjectId: state.projects[projectId] ? projectId : undefined,
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
              currentProjectId: Object.keys(updatedProjects)[0] || undefined,
              projects: updatedProjects,
            };
          });
        },

        removeLanguage: (languageId) => {
          set((state) => {
            const currentProject = state.projects[state.currentProjectId ?? ""];
            if (!currentProject) return state;

            const language = currentProject.fileLanguageMap.find(
              (lang) => lang.id === languageId,
            )?.language;
            if (!language) return state;

            // snapshot previous data
            const prevSnapshot = deepClone(currentProject.data);

            // remove language from data (operate on a deep clone)
            const updatedData = deepClone(currentProject.data);
            delete updatedData[language];

            const updatedCurrentProject: Project = {
              ...currentProject,
              fileLanguageMap: currentProject.fileLanguageMap.filter(
                (lang) => lang.id !== languageId,
              ),
              data: updatedData,
              undoableStack: {
                undoStack: addToUndoStack(
                  currentProject.undoableStack.undoStack,
                  prevSnapshot,
                ),
                redoStack: [],
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

        removeTranslationByKey: (key) => {
          set((state) => {
            const currentProject = state.projects[state.currentProjectId ?? ""];
            if (!currentProject) return state;

            const prevSnapshot = deepClone(currentProject.data);
            const updatedData = deepClone(currentProject.data);

            for (const lang in updatedData) {
              if (Object.prototype.hasOwnProperty.call(updatedData, lang)) {
                delete updatedData[lang][key];
              }
            }

            const updatedCurrentProject: Project = {
              ...currentProject,
              data: updatedData,
              undoableStack: {
                undoStack: addToUndoStack(
                  currentProject.undoableStack.undoStack,
                  prevSnapshot,
                ),
                redoStack: [],
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

            if (oldKey === newKey) return state;

            const prevSnapshot = deepClone(currentProject.data);
            const updatedData = deepClone(currentProject.data);

            for (const lang in updatedData) {
              if (Object.prototype.hasOwnProperty.call(updatedData, lang)) {
                // guard if oldKey doesn't exist
                if (
                  Object.prototype.hasOwnProperty.call(
                    updatedData[lang],
                    oldKey,
                  )
                ) {
                  updatedData[lang][newKey] = updatedData[lang][oldKey];
                  delete updatedData[lang][oldKey];
                }
              }
            }

            const updatedCurrentProject: Project = {
              ...currentProject,
              data: updatedData,
              undoableStack: {
                undoStack: addToUndoStack(
                  currentProject.undoableStack.undoStack,
                  prevSnapshot,
                ),
                redoStack: [],
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

            const prevSnapshot = deepClone(currentProject.data);
            const updatedData = deepClone(currentProject.data);

            for (const lang in updatedData) {
              if (Object.prototype.hasOwnProperty.call(updatedData, lang)) {
                // ensure language object exists
                updatedData[lang] = updatedData[lang] || {};
                updatedData[lang][key] = "";
              }
            }

            const updatedCurrentProject: Project = {
              ...currentProject,
              data: updatedData,
              undoableStack: {
                undoStack: addToUndoStack(
                  currentProject.undoableStack.undoStack,
                  prevSnapshot,
                ),
                redoStack: [],
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

            const prevSnapshot = deepClone(currentProject.data);
            const updatedData = deepClone(currentProject.data);

            // ensure language map exists
            updatedData[language] = updatedData[language] || {};
            updatedData[language][key] = value;

            const updatedCurrentProject: Project = {
              ...currentProject,
              data: updatedData,
              undoableStack: {
                undoStack: addToUndoStack(
                  currentProject.undoableStack.undoStack,
                  prevSnapshot,
                ),
                redoStack: [],
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

        undoTranslation: () => {
          set((state) => {
            const currentProject = state.projects[state.currentProjectId ?? ""];
            if (!currentProject) return state;

            const newUndoStack = [...currentProject.undoableStack.undoStack];
            const previousData = newUndoStack.pop();
            if (!previousData) return state;

            const updatedCurrentProject: Project = {
              ...currentProject,
              data: previousData,
              undoableStack: {
                undoStack: newUndoStack,
                redoStack: addToUndoStack(
                  currentProject.undoableStack.redoStack,
                  deepClone(currentProject.data),
                ),
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

        redoTranslation: () => {
          set((state) => {
            const currentProject = state.projects[state.currentProjectId ?? ""];
            if (!currentProject) return state;

            const newRedoStack = [...currentProject.undoableStack.redoStack];
            const nextData = newRedoStack.pop();
            if (!nextData) return state;

            const updatedCurrentProject: Project = {
              ...currentProject,
              data: nextData,
              undoableStack: {
                undoStack: addToUndoStack(
                  currentProject.undoableStack.undoStack,
                  deepClone(currentProject.data),
                ),
                redoStack: newRedoStack,
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

        updateData: (data) => {
          set((state) => {
            const currentProject = state.projects[state.currentProjectId ?? ""];
            if (!currentProject) return state;

            const mergedData = { ...currentProject.data };
            for (const lang in data) {
              if (Object.prototype.hasOwnProperty.call(data, lang)) {
                mergedData[lang] = {
                  ...(mergedData[lang] || {}),
                  ...data[lang],
                };
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
            set({ currentProjectFiles: [] });
            return;
          }
          try {
            const files = await window.electronAPI.fileManager.readProjectFiles(
              currentProject.path,
            );
            set({ currentProjectFiles: files });
          } catch (error) {
            console.error("Failed to fetch project files:", error);
            set({ currentProjectFiles: [] });
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
        merge: (persisted, current) => {
          const merged = deepMerge(current, persisted) as ProjectStore;

          // ensure top-level shape
          merged.currentProjectId = merged.currentProjectId ?? undefined;

          // migrate each saved project
          const migratedProjects: Record<string, Project> = {};
          for (const id of Object.keys(merged.projects || {})) {
            const p = merged.projects[id];
            migratedProjects[id] = {
              id: p.id ?? crypto.randomUUID(),
              name: p.name ?? "Untitled",
              path: p.path ?? "",
              i18nPath: p.i18nPath ?? "",
              fileLanguageMap: p.fileLanguageMap ?? [],
              createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
              updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
              translationCount: p.translationCount ?? 0,
              data: p.data ?? {},
              undoableStack: {
                undoStack: limitStackSize(p.undoableStack?.undoStack ?? []),
                redoStack: limitStackSize(p.undoableStack?.redoStack ?? []),
              },
            };
          }
          merged.projects = migratedProjects;

          return merged;
        },
      },
    ),
  ),
);

export const currentProjectSelector: ProjectSelector<Project | undefined> = (
  state,
) =>
  state.currentProjectId ? state.projects[state.currentProjectId] : undefined;

export const currentProjectLanguageSelector: ProjectSelector<string[]> = (
  state,
) =>
  state.currentProjectId
    ? (state.projects[state.currentProjectId]?.fileLanguageMap.map(
        (lang) => lang.language,
      ) ?? [])
    : [];

export const canRedoSelector: ProjectSelector<boolean> = (state) =>
  state.currentProjectId
    ? state.projects[state.currentProjectId]?.undoableStack.redoStack.length > 0
    : false;

export const canUndoSelector: ProjectSelector<boolean> = (state) =>
  state.currentProjectId
    ? state.projects[state.currentProjectId]?.undoableStack.undoStack.length > 0
    : false;
