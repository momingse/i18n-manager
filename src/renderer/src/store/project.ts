import { LanguageCode } from "@/constants/constants";
import { SetStateAction } from "react";
import { create } from "zustand";

export type Project = {
  id: string;
  name: string;
  description: string;
  languages: LanguageCode[];
  createdAt: Date;
  updatedAt: Date;
  translationCount: number;
  data: Record<string, Record<LanguageCode, string>>;
};

interface ProjectStore {
  currentProjectId: string | null;
  projects: Record<string, Project>;
  createProject: (
    projectName: string,
    description: string,
    languages: LanguageCode[],
  ) => void;
  switchProject: (projectId: string) => void;
  updateProject: (project: Project) => void;
  setLanguages: (updater: SetStateAction<LanguageCode[]>) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  currentProjectId: null,
  projects: {},
  createProject: (projectName, description, languages) => {
    const newProject = {
      id: crypto.randomUUID(),
      name: projectName,
      description,
      languages,
      createdAt: new Date(),
      updatedAt: new Date(),
      translationCount: 0,
      data: {},
    };
    set((state) => ({
      projects: {
        ...state.projects,
        [newProject.id]: newProject,
      },
      currentProjectId: newProject.id,
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
  setLanguages: (updater) => {
    set((state) => {
      if (!state.currentProjectId || !state.projects[state.currentProjectId]) {
        return state;
      }

      const currentProject = state.projects[state.currentProjectId];
      const nextLanguages =
        typeof updater === "function"
          ? updater(currentProject.languages)
          : updater;

      return {
        projects: {
          ...state.projects,
          [state.currentProjectId]: {
            ...currentProject,
            languages: nextLanguages,
          },
        },
      };
    });
  },
}));
