import { LLMConfig, LLMProvider } from "@/types/llm";

const translationWithLanguages = async (
  provider: LLMProvider,
  llmConfig: LLMConfig,
  fileContent: string,
  languages: string[],
): Promise<Record<string, Record<string, string>>> => {
  // Ensure consistent language naming
  const prompt = `You are a professional i18n translator. You MUST follow these instructions EXACTLY to ensure consistency.

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON - no explanations, markdown, or extra text
2. ALL languages must have IDENTICAL keys
3. Use EXACT language names as provided: [${languages.join(", ")}]

STEP 1 - TEXT EXTRACTION:
Extract ONLY user-facing text from the code:
✓ INCLUDE: Button labels, form labels, error messages, success messages, tooltips, placeholders, modal titles, navigation text, validation messages, notifications
✗ EXCLUDE: Variable names, function names, class names, comments, console.log, API endpoints, CSS classes, HTML attributes, file paths, technical identifiers

STEP 2 - KEY GENERATION:
Create consistent keys using dot notation in STRICT camelCase format:
- Pattern: category.element.type
- Categories: auth, nav, form, button, error, success, modal, table, general
- Elements: title, label, placeholder, message, text, link, description
- ALL parts must be in camelCase: "authLoginTitle", "formEmailPlaceholder", "buttonSubmitText", "errorValidationMessage"
- For compound words: "userProfileSettings", "passwordResetForm", "emailVerificationMessage"
- Examples: "auth.login.title" → "authLoginTitle", "form.email.placeholder" → "formEmailPlaceholder"

STEP 3 - TRANSLATION:
- Maintain professional tone appropriate for software UI
- Preserve formatting placeholders (%s, {variable}, {{value}})
- Keep technical terms consistent across languages
- Ensure cultural appropriateness

MANDATORY OUTPUT STRUCTURE:
{${languages
    .map(
      (lang) => `
  "${lang}": {
    "exampleCamelCaseKey": "translated text for ${lang}"
  }`,
    )
    .join(",")}}

VALIDATION REQUIREMENTS:
- Every language object must have identical key sets
- All keys MUST be in camelCase format
- No missing or extra keys in any language
- All values must be non-empty strings
- Valid JSON syntax only

CODE TO ANALYZE:
\`\`\`
${fileContent}
\`\`\`

Remember: Output ONLY the JSON object with camelCase keys. No additional text before or after.`;

  let attempts = 0;

  while (attempts < 3) {
    attempts++;
    try {
      const result = await window.electronAPI.llm.translationFile(
        provider,
        llmConfig,
        prompt,
      );

      const receivedLanguages = Object.keys(result || {});
      if (receivedLanguages.length === 0) {
        throw new Error("No translations returned");
      }

      if (receivedLanguages.length !== languages.length) {
        throw new Error(
          `Expected ${languages.length} languages, but received ${receivedLanguages.length}`,
        );
      }

      // TODO: add fuzzy matching
      const mappedResult: Record<string, Record<string, string>> = {};
      for (const targetLange of languages) {
        if (receivedLanguages.includes(targetLange)) {
          mappedResult[targetLange] = result[targetLange];
          continue;
        }

        const caseInsensitiveMatch = receivedLanguages.find(
          (lang) => lang.toLowerCase() === targetLange.toLowerCase(),
        );
        if (caseInsensitiveMatch) {
          mappedResult[targetLange] = result[caseInsensitiveMatch];
          continue;
        }

        console.warn(
          `Attempt ${attempts} failed to match language: ${targetLange}`,
        );
        break;
      }

      if (
        Object.keys(mappedResult).length === languages.length &&
        Object.values(mappedResult).every(
          (lang) => Object.keys(lang).length > 0,
        )
      ) {
        return mappedResult;
      }

      console.warn(
        `Attempt ${attempts} failed to match all languages: ${languages}`,
      );
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error);
    }
  }

  throw new Error("Failed to make LLM request");

  // try {
  //   const result = await window.electronAPI.llm.translationFile(
  //     provider,
  //     llmConfig,
  //     prompt,
  //   );

  //   // Validation step to ensure consistency
  //   const languageKeys = Object.keys(result);
  //   if (languageKeys.length === 0) {
  //     throw new Error("No translations returned");
  //   }

  //   // Get keys from first language as reference
  //   const referenceKeys = Object.keys(result[languageKeys[0]] || {});

  //   // Validate all languages have same keys
  //   for (const lang of languageKeys) {
  //     const currentKeys = Object.keys(result[lang] || {});
  //     if (currentKeys.length !== referenceKeys.length) {
  //       console.warn(`Inconsistent key count for language: ${lang}`);
  //     }

  //     const missingKeys = referenceKeys.filter((key) => !(key in result[lang]));
  //     if (missingKeys.length > 0) {
  //       console.warn(`Missing keys in ${lang}:`, missingKeys);
  //     }
  //   }

  //   return result;
  // } catch (error) {
  //   console.error("Error making LLM request:", error);
  //   throw error;
  // }
};

export default translationWithLanguages;
