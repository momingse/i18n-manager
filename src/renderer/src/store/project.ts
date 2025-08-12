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
  currentProject: Project | null;
  projects: Project[];
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
  currentProject: null,
  projects: [],
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
      projects: [...state.projects, newProject],
      currentProject: newProject,
    }));
  },
  switchProject: (projectId) => {
    set((state) => ({
      currentProject: state.projects.find(
        (project) => project.id === projectId,
      ),
    }));
  },
  updateProject: (project) => set({ currentProject: project }),
  setLanguages: (updater) => {
    set((state) => {
      if (!state.currentProject) return state;
      const nextLanguages =
        typeof updater === "function"
          ? updater(state.currentProject.languages)
          : updater;

      return {
        currentProject: {
          ...state.currentProject,
          languages: nextLanguages,
        },
      };
    });
  },
}));
