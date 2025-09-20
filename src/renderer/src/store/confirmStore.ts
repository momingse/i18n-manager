import { StoreSelector } from "@/types/store";
import { create } from "zustand";

export interface ConfirmAction {
  key: string;
  text: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  callbackFn?: () => void;
}

export interface Confirmation {
  id: string;
  title: string;
  description?: string;
  actions: ConfirmAction[];
  priority?: number; // Optional: for ordering confirmations
}

interface ConfirmStore {
  confirmations: Confirmation[];

  // Actions
  addConfirmation: (confirmation: Omit<Confirmation, "id">) => void;
  addConfirmations: (confirmations: Omit<Confirmation, "id">[]) => void;
  closeCurrentConfirm: () => void;
  clearAllConfirmations: () => void;
  removeConfirmation: (id: string) => void;
}

type ConfirmSelector<U> = StoreSelector<ConfirmStore, U>;

export const useConfirmStore = create<ConfirmStore>((set) => ({
  confirmations: [],

  // Add a single confirmation
  addConfirmation: (confirmation) => {
    const id = crypto.randomUUID();
    const newConfirmation = { ...confirmation, id };

    set((state) => ({
      confirmations: [...state.confirmations, newConfirmation],
    }));
  },

  // Add multiple confirmations at once (useful for batch operations)
  addConfirmations: (confirmations) => {
    const newConfirmations = confirmations.map((conf) => ({
      ...conf,
      id: crypto.randomUUID(),
    }));

    set((state) => ({
      confirmations: [...state.confirmations, ...newConfirmations],
    }));
  },

  // Remove the current (first) confirmation from the queue
  closeCurrentConfirm: () => {
    set((state) => ({
      confirmations: state.confirmations.slice(1),
    }));
  },

  // Clear all confirmations
  clearAllConfirmations: () => {
    set({ confirmations: [] });
  },

  // Remove a specific confirmation by ID
  removeConfirmation: (id) => {
    set((state) => ({
      confirmations: state.confirmations.filter((conf) => conf.id !== id),
    }));
  },
}));

export const hasConfirmationsSelector: ConfirmSelector<boolean> = (
  state: ConfirmStore,
) => state.confirmations.length > 0;

export const currentConfirmationSelector: ConfirmSelector<Confirmation> = (
  state: ConfirmStore,
) => state.confirmations[0];

export const createYesNoConfirmation = (
  title: string,
  description?: string,
  onYes?: () => void,
  onNo?: () => void,
): Omit<Confirmation, "id"> => ({
  title,
  description,
  actions: [
    {
      key: "no",
      text: "No",
      variant: "outline",
      callbackFn: onNo,
    },
    {
      key: "yes",
      text: "Yes",
      variant: "destructive",
      callbackFn: onYes,
    },
  ],
});

export const createBatchConfirmations = (
  items: Array<{
    title: string;
    description?: string;
    onConfirm?: () => void;
    onSkip?: () => void;
  }>,
): Omit<Confirmation, "id">[] => {
  return items.map((item) => ({
    title: item.title,
    description: item.description,
    actions: [
      {
        key: "skip",
        text: "Skip",
        variant: "outline",
        callbackFn: item.onSkip,
      },
      {
        key: "confirm",
        text: "Confirm",
        variant: "destructive",
        callbackFn: item.onConfirm,
      },
    ],
  }));
};
