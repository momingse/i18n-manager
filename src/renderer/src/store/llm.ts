import { jsonStorage } from "@/lib/electronStore";
import { LLMConfig, LLMProvider } from "@/types/llm";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type LLMStoreState = {
  llmProvider: LLMProvider;
  llmConfig: LLMConfig;
};

type LLMStoreActions = {
  setLLMProvider: (provider: LLMProvider) => void;
  setLLMConfig: (config: LLMConfig) => void;
};

type LLMState = LLMStoreState & LLMStoreActions;

export const useLLMStore = create<LLMState>()(
  persist(
    (set) => ({
      llmProvider: LLMProvider.gemini,
      llmConfig: {
        model: "gemini-2.5-flash",
      },
      setLLMProvider: (provider) => set({ llmProvider: provider }),
      setLLMConfig: (config) => set({ llmConfig: config }),
    }),
    {
      name: "llm-store",
      partialize: (state) => ({
        llmProvider: state.llmProvider,
        llmConfig: state.llmConfig,
      }),
      storage: createJSONStorage(() => jsonStorage),
    },
  ),
);
