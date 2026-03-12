import { create } from "zustand";

export interface JointSpec {
  name: string;
  type: string;
  parent: string | null;
  child: string | null;
}

export interface LinkSpec {
  name: string;
}

export interface StructureSpec {
  robot_name: string;
  links: LinkSpec[];
  joints: JointSpec[];
}

interface StructureState {
  urdfCode: string;
  structureSpec: StructureSpec | null;
  setUrdfCode: (code: string) => void;
  setStructureSpec: (spec: StructureSpec) => void;
  reset: () => void;
}

export const useStructureStore = create<StructureState>((set) => ({
  urdfCode: "",
  structureSpec: null,
  setUrdfCode: (code) => set({ urdfCode: code }),
  setStructureSpec: (spec) => set({ structureSpec: spec }),
  reset: () => set({ urdfCode: "", structureSpec: null }),
}));
