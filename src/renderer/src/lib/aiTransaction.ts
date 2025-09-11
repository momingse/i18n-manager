import { LLMConfig, LLMProvider } from "@/types/llm";

const translationWithLanguages = async (
  provider: LLMProvider,
  llmConfig: LLMConfig,
  fileContent: string,
  languages: string[],
): Promise<Record<string, Record<string, string>>> => {
  const prompt = `
You are a professional i18n translator for software applications. Follow these instructions EXACTLY.

TASK: Extract user-facing text from the provided code and generate consistent translations.

EXTRACTION RULES:
1. Extract ONLY user-visible text (button labels, error messages, UI text, placeholders, tooltips)
2. IGNORE: variable names, function names, class names, comments, console logs, API endpoints
3. IGNORE: technical strings like CSS classes, HTML attributes, database fields
4. Include text from: string literals in JSX/HTML, form labels, validation messages, notifications

KEY NAMING RULES (CRITICAL FOR CONSISTENCY):
- Use dot notation: category.subcategory.element
- Categories: auth, nav, form, button, error, success, modal, table, etc.
- Elements: title, label, placeholder, message, text, link, etc.
- Examples: "auth.login.title", "form.email.placeholder", "button.submit.text"
- Use camelCase for multi-word elements: "confirmPassword" not "confirm_password"

TRANSLATION REQUIREMENTS:
1. Maintain the EXACT SAME keys across all languages
2. Preserve formatting characters (%s, {variable}, etc.)
3. Keep technical terms consistent (e.g., "API" stays "API" in all languages)
4. Maintain appropriate formality level for each language

OUTPUT FORMAT:
Return ONLY valid JSON. No explanations, no markdown, no additional text.

TARGET LANGUAGES: ${languages.join(", ")}

CODE TO ANALYZE:
\`\`\`
${fileContent}
\`\`\`

REQUIRED JSON STRUCTURE:
{
  "English": {
    "category.element.type": "translated text",
    "category.element.type": "translated text"
  },
  "Spanish": {
    "category.element.type": "texto traducido",
    "category.element.type": "texto traducido"
  }
}

VALIDATION CHECKLIST:
- ✓ Same keys in all language objects
- ✓ No code/technical strings included
- ✓ Proper dot notation naming
- ✓ Valid JSON format
- ✓ No extra text outside JSON
`;

  try {
    const result = await window.electronAPI.llm.translationFile(
      provider,
      llmConfig,
      prompt,
    );

    // Validation step to ensure consistency
    const languageKeys = Object.keys(result);
    if (languageKeys.length === 0) {
      throw new Error("No translations returned");
    }

    // Get keys from first language as reference
    const referenceKeys = Object.keys(result[languageKeys[0]] || {});

    // Validate all languages have same keys
    for (const lang of languageKeys) {
      const currentKeys = Object.keys(result[lang] || {});
      if (currentKeys.length !== referenceKeys.length) {
        console.warn(`Inconsistent key count for language: ${lang}`);
      }

      const missingKeys = referenceKeys.filter((key) => !(key in result[lang]));
      if (missingKeys.length > 0) {
        console.warn(`Missing keys in ${lang}:`, missingKeys);
      }
    }

    return result;
  } catch (error) {
    console.error("Error making LLM request:", error);
    throw error;
  }
};

export default translationWithLanguages;
