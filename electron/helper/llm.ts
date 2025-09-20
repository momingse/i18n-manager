import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOllama } from "ollama-ai-provider-v2";
import { generateObject, generateText, Schema } from "ai";
import { LLMConfig, LLMProvider } from "../types/llm";

export const llmCaller = async (
  apiKey: string,
  prompt: string,
  schema: Schema | undefined,
  provider: LLMProvider,
  llmConfig: LLMConfig,
): Promise<any> => {
  let model;
  switch (provider) {
    case LLMProvider.gemini: {
      const google = createGoogleGenerativeAI({ apiKey });
      model = google(llmConfig.model);
      break;
    }
    case LLMProvider.ollama: {
      const ollama = createOllama({ baseURL: llmConfig.baseUrl });
      model = ollama(llmConfig.model);
      break;
    }
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }

  if (schema) {
    const { object } = await generateObject({
      model: model,
      prompt: prompt,
      schema: schema,
      providerOptions: {
        google: {
          structuredOutputs: false,
        },
      },
    });
    return object;
  } else {
    const { text } = await generateText({
      model: model,
      prompt: prompt,
    });
    return text;
  }
};
