export enum LLMProvider {
  gemini = "gemini",
  openai = "openai",
  claude = "claude",
  xai = "xai",
}

export interface LLMConfig {
  model: string;
}
