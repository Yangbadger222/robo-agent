import { create } from "zustand";

export interface MotorSelection {
  joint_name: string;
  motor_type: string;
  recommended_motor: string;
  mpn: string;
  manufacturer: string;
  torque_nm: number;
  speed_rpm: number;
  voltage: number;
  estimated_price: number;
  reason: string;
}

interface MotorState {
  motorSelections: MotorSelection[];
  setMotorSelections: (selections: MotorSelection[]) => void;
  reset: () => void;
}

export const useMotorStore = create<MotorState>((set) => ({
  motorSelections: [],
  setMotorSelections: (selections) => set({ motorSelections: selections }),
  reset: () => set({ motorSelections: [] }),
}));
