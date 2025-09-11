/// <reference types="vite-plugin-electron/electron-env" />

import { LLMConfig, LLMProvider } from "./types/llm";

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string;
    /** /dist/ or /public/ */
    VITE_PUBLIC: string;
  }
}

type IpcRendererHandler<K extends keyof IPCContract> = (
  ...args: IPCContract[K]["args"]
) => Promise<IPCContract[K]["return"]>;

// Used in Renderer process, expose in `preload.ts`
declare global {
  interface Window {
    ipcRenderer: import("electron").IpcRenderer;
    electronAPI: {
      storage: {
        // getItem: (key: string) => Promise<string | null>;
        getItem: (key: string) => Promise<string | null>;
        setItem: (key: string, value: string) => Promise<boolean>;
        removeItem: (key: string) => Promise<boolean>;
      };
      fileManager: {
        readProjectFiles: (projectPath: string) => Promise<ProjectFile[]>;
        readFileContent: (filePath: string) => Promise<string>;
        writeFileContent: (filePath: string, content: string) => Promise<boolean>;
      };
      llm: {
        storeApiKey: (
          apiKey: string,
          provider: LLMProvider,
        ) => Promise<boolean>;
        deleteApiKey: (provider: LLMProvider) => Promise<boolean>;
        hasApiKey: (provider: LLMProvider) => Promise<boolean>;
        translationFile: (
          provider: LLMProvider,
          llmConfig: LLMConfig,
          prompt: string,
        ) => Promise<any>;
      };
    };
  }
}
