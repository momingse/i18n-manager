import { contextBridge, ipcRenderer } from "electron";
import { LLMIPCChannel, ReadFilesIPCChannel, StorageIPCChannel } from "./ipc";

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args),
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("electronAPI", {
  storage: {
    getItem: (key) => ipcRenderer.invoke(StorageIPCChannel.getItem, key),
    setItem: (key, value) =>
      ipcRenderer.invoke(StorageIPCChannel.setItem, key, value),

    removeItem: (key: string): Promise<boolean> =>
      ipcRenderer.invoke(StorageIPCChannel.removeItem, key),
  },

  readFiles: {
    readProjectFiles: (projectPath) =>
      ipcRenderer.invoke(ReadFilesIPCChannel.readProjectFiles, projectPath),

    readFileContent: (filePath) =>
      ipcRenderer.invoke(ReadFilesIPCChannel.readFileContent, filePath),
  },
  llm: {
    storeApiKey: (apiKey, provider) =>
      ipcRenderer.invoke(LLMIPCChannel.storeApiKey, apiKey, provider),
    deleteApiKey: (provider) =>
      ipcRenderer.invoke(LLMIPCChannel.deleteApiKey, provider),
    hasApiKey: (provider) =>
      ipcRenderer.invoke(LLMIPCChannel.hasApiKey, provider),
    translationFile: (provider, llmConfig, prompt) =>
      ipcRenderer.invoke(
        LLMIPCChannel.translationFile,
        provider,
        llmConfig,
        prompt,
      ),
  },
} satisfies Window["electronAPI"]);
