import { LLMConfig, LLMProvider } from "@/types/llm";

const translationWithLanguages = async (
  provider: LLMProvider,
  llmConfig: LLMConfig,
  fileContent: string,
  languages: string[],
): Promise<Record<string, Record<string, string>>> => {
  const prompt = `
You are a professional translator specializing in i18n JSON translations for software applications.

Your task:
1. Extract all user-facing text from the provided code file.
2. Generate translations for the extracted text in the following languages: ${languages.join(", ")}.
3. Return a JSON object where:
   - Top-level keys are the language codes.
   - Nested objects contain i18n keys (camelCase, derived from the context of the text) and their translations.
   - All languages use the same i18n keys but with translated values.

Code file:
\`\`\`
${fileContent}
\`\`\`

Output format: Return ONLY a valid JSON object (no explanations or additional text) with language codes as keys and nested i18n key-value pairs. Example:
{
  "English": {
    "login.redirectButton": "Continue",
    "navbar.homeLink": "Home"
  },
  "Spanish": {
    "login.redirectButton": "Continuar",
    "navbar.homeLink": "Inicio"
  }
}
  `;

  try {
    const result = await window.electronAPI.llm.translationFile(
      provider,
      llmConfig,
      prompt,
    );

    return result;
  } catch (error) {
    console.error("Error making LLM request:", error);
    throw error;
  }
};

export default translationWithLanguages;
