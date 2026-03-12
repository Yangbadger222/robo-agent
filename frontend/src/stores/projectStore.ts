import { create } from "zustand";

export interface ProjectSpec {
  project_id: string;
  robot_name: string;
  robot_type: string;
  dof: number;
  payload_kg: number;
  reach_m: number;
  budget_usd: number;
  description: string;
}

interface ProjectState {
  projectSpec: ProjectSpec | null;
  setProjectSpec: (spec: ProjectSpec) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectSpec: null,
  setProjectSpec: (spec) => set({ projectSpec: spec }),
  reset: () => set({ projectSpec: null }),
}));
