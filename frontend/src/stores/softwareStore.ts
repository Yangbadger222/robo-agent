import { create } from "zustand";

interface SoftwareState {
  generatedCode: Record<string, string>;
  setGeneratedCode: (code: Record<string, string>) => void;
  addFile: (filename: string, content: string) => void;
  reset: () => void;
}

export const useSoftwareStore = create<SoftwareState>((set) => ({
  generatedCode: {},
  setGeneratedCode: (code) => set({ generatedCode: code }),
  addFile: (filename, content) =>
    set((state) => ({
      generatedCode: { ...state.generatedCode, [filename]: content },
    })),
  reset: () => set({ generatedCode: {} }),
}));
