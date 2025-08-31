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
};

type TranslationState = TranslationStoreState & TranslationStoreActions;

export const useTranslationStore = create<TranslationState>((set) => ({
  translationResult: undefined,
  setTranslationResult: (result) => set({ translationResult: result }),
}));
