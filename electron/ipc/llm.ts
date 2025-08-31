import { safeStorage } from "electron";
import { handleIPC, LLMIPCChannel } from ".";
import { llmCaller } from "../helper/llm";
import { storeGetItem, storeRemoveItem, storeSetItem } from "../helper/storage";
import z from "zod";

export const setupLLMIPCHandler = () => {
  handleIPC(LLMIPCChannel.storeApiKey, async (_evt, apiKey, provider) => {
    if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
      throw new Error("Invalid API key");
    }

    const encryptedBuffer = safeStorage.encryptString(apiKey);
    const encryptedBase64 = Buffer.from(encryptedBuffer).toString("base64");

    try {
      await storeSetItem(provider, encryptedBase64);
    } catch (error) {
      console.error("Error setting item in storage:", error);
      return false;
    }

    return true;
  });

  handleIPC(LLMIPCChannel.deleteApiKey, async (_evt, provider) => {
    try {
      await storeRemoveItem(provider);
    } catch (error) {
      console.error("Error removing item from storage:", error);
      return false;
    }
    return true;
  });

  handleIPC(LLMIPCChannel.hasApiKey, async (_evt, provider) => {
    try {
      const apiKey = await storeGetItem(provider);
      return apiKey !== null;
    } catch (error) {
      console.error("Error getting item from storage:", error);
      return false;
    }
  });

  handleIPC(
    LLMIPCChannel.translationFile,
    async (_evt, provider, llmConfig, prompt) => {
      if (typeof prompt !== "string" || prompt.trim().length === 0) {
        throw new Error("Invalid prompt");
      }

      const encryptedApiKey = await storeGetItem(provider);
      if (!encryptedApiKey) throw new Error("No API key configured");

      const encryptedBuffer = Buffer.from(encryptedApiKey, "base64");
      const apiKey = encryptedApiKey
        ? safeStorage.decryptString(encryptedBuffer)
        : null;
      if (!apiKey) throw new Error("Invalid API key");

      const schema = z.record(
        z.string().describe("language"),
        z.record(
          z.string().describe("i18n key"),
          z.string().describe("translation"),
        ),
      );

      // Make the provider call:
      const result = await llmCaller(
        apiKey,
        prompt,
        schema as any,
        provider,
        llmConfig,
      );
      return result;
    },
  );
};
