import { COMMON_LANGUAGES } from "@/constants/constants";

export const detectLanguageFromFilename = (filename: string): string => {
  const name = filename.replace(".json", "").toLowerCase();
  const foundLanguage = COMMON_LANGUAGES.find((lang) => lang.code === name);
  return foundLanguage
    ? foundLanguage.name
    : name.charAt(0).toUpperCase() + name.slice(1);
};
