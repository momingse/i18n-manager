import { create } from "zustand";

/* 
Example translationResult:
{
  "language1": {
    "translationKey1": "translationValue1"
    "translationKey2": "translationValue2"
  },
  "language2": {
    "translationKey1": "translationValue1"
    "translationKey2": "translationValue2"
  }
}
*/

type TranslationStoreState = {
  translationResult?: Record<string, Record<string, string>>;
};

type TranslationStoreActions = {
  setTranslationResult: (
    result: Record<string, Record<string, string>>,
  ) => void;
  updateTranslation: (language: string, key: string, value: string) => void;
  removeTranslationKey: (language: string, key: string) => void;
};

type TranslationState = TranslationStoreState & TranslationStoreActions;

export const useTranslationStore = create<TranslationState>((set, get) => ({
  translationResult: undefined,

  setTranslationResult: (result) => set({ translationResult: result }),

  updateTranslation: (language, key, value) => {
    const current = get().translationResult;
    if (!current) return;

    set({
      translationResult: {
        ...current,
        [language]: {
          ...current[language],
          [key]: value,
        },
      },
    });
  },

  removeTranslationKey: (language, key) => {
    const current = get().translationResult;
    if (!current || !current[language]) return;

    const { [key]: removed, ...remaining } = current[language];

    set({
      translationResult: {
        ...current,
        [language]: remaining,
      },
    });
  },
}));
