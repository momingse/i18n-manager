// src/types/ipc.ts
import { LLMConfig, LLMProvider } from "../types/llm";
import { ProjectFile } from "@/store/project";
import { Schema } from "ai";
import { ipcMain, IpcMainInvokeEvent } from "electron";

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

export enum ReadFilesIPCChannel {
  readProjectFiles = "readFiles:read-project-files",
  readFileContent = "readFiles:read-file-content",
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

export interface ReadFilesIPC {
  [ReadFilesIPCChannel.readProjectFiles]: {
    args: [projectPath: string];
    return: ProjectFile[];
  };
  [ReadFilesIPCChannel.readFileContent]: {
    args: [filePath: string];
    return: string;
  };
}

// Root contract
export interface IPCContract extends LLMIPC, StorageIPC, ReadFilesIPC {}

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
