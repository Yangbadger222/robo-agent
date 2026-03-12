import { create } from "zustand";

export interface HardwareItem {
  category: string;
  name: string;
  mpn: string;
  manufacturer: string;
  reason: string;
  estimated_price: number;
  specifications: Record<string, string>;
}

interface HardwareState {
  hardwareBom: HardwareItem[];
  setHardwareBom: (bom: HardwareItem[]) => void;
  reset: () => void;
}

export const useHardwareStore = create<HardwareState>((set) => ({
  hardwareBom: [],
  setHardwareBom: (bom) => set({ hardwareBom: bom }),
  reset: () => set({ hardwareBom: [] }),
}));
