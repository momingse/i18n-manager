// src/types/ipc.ts
import { ProjectFile } from "@/store/project";
import { ipcMain, IpcMainInvokeEvent } from "electron";
import { LLMConfig, LLMProvider } from "../types/llm";

export enum LLMIPCChannel {
  storeApiKey = "llm:store-api-key",
  deleteApiKey = "llm:delete-api-key",
  hasApiKey = "llm:has-api-key",
  translationFile = "llm:make-llm-request",
}

export enum StorageIPCChannel {
  getItem = "storage:getItem",
  setItem = "storage:setItem",
  removeItem = "storage:removeItem",
}

export enum FileManagerIPCChannel {
  readProjectFiles = "fileManager:read-project-files",
  readProjectFolders = "fileManager:read-project-folders",
  readFileContent = "fileManager:read-file-content",
  writeFileContent = "fileManager:write-file-content",
}

// Contracts
export interface LLMIPC {
  [LLMIPCChannel.storeApiKey]: {
    args: [apiKey: string, provider: LLMProvider];
    return: boolean;
  };
  [LLMIPCChannel.deleteApiKey]: {
    args: [provider: LLMProvider];
    return: boolean;
  };
  [LLMIPCChannel.hasApiKey]: {
    args: [provider: LLMProvider];
    return: boolean;
  };
  [LLMIPCChannel.translationFile]: {
    args: [provider: LLMProvider, llmConfig: LLMConfig, prompt: string];
    return: any;
  };
}

export interface StorageIPC {
  [StorageIPCChannel.getItem]: { args: [key: string]; return: string | null };
  [StorageIPCChannel.setItem]: {
    args: [key: string, value: string];
    return: boolean;
  };
  [StorageIPCChannel.removeItem]: { args: [key: string]; return: boolean };
}

export interface FileManagerIPC {
  [FileManagerIPCChannel.readProjectFiles]: {
    args: [projectPath: string];
    return: ProjectFile[];
  };
  [FileManagerIPCChannel.readProjectFolders]: {
    args: [projectPath: string];
    return: ProjectFile[];
  };
  [FileManagerIPCChannel.readFileContent]: {
    args: [filePath: string];
    return: string;
  };
  [FileManagerIPCChannel.writeFileContent]: {
    args: [filePath: string, content: string];
    return: boolean;
  };
}

// Root contract
export interface IPCContract extends LLMIPC, StorageIPC, FileManagerIPC {}

type Handler<K extends keyof IPCContract> = (
  event: IpcMainInvokeEvent,
  ...args: IPCContract[K]["args"]
) => Promise<IPCContract[K]["return"]> | IPCContract[K]["return"];

export function handleIPC<K extends keyof IPCContract>(
  channel: K,
  listener: Handler<K>,
) {
  ipcMain.handle(channel, listener);
}
