export enum LLMProvider {
  gemini = "gemini",
  // openai = "openai",
  // claude = "claude",
  // xai = "xai",
  ollama = "ollama",
}

export interface LLMConfig {
  model: string;
  baseUrl?: string;
}
