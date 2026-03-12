import { create } from "zustand";

export type StepId = "project" | "structure" | "motor" | "hardware" | "software" | "review";

export type StepStatus = "locked" | "current" | "completed" | "stale";

interface StepMeta {
  id: StepId;
  label: string;
  status: StepStatus;
}

const STEP_ORDER: StepId[] = ["project", "structure", "motor", "hardware", "software", "review"];

const STEP_LABELS: Record<StepId, string> = {
  project: "Project",
  structure: "Structure",
  motor: "Motors",
  hardware: "Hardware",
  software: "Software",
  review: "Review",
};

interface PipelineState {
  currentStep: StepId;
  stepStatuses: Record<StepId, StepStatus>;

  goToStep: (step: StepId) => void;
  completeStep: (step: StepId) => void;
  markStale: (fromStep: StepId) => void;
  getStepIndex: (step: StepId) => number;
  canNavigateTo: (step: StepId) => boolean;
  getSteps: () => StepMeta[];
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  currentStep: "project",
  stepStatuses: {
    project: "current",
    structure: "locked",
    motor: "locked",
    hardware: "locked",
    software: "locked",
    review: "locked",
  },

  getSteps: () =>
    STEP_ORDER.map((id) => ({
      id,
      label: STEP_LABELS[id],
      status: get().stepStatuses[id],
    })),

  getStepIndex: (step: StepId) => STEP_ORDER.indexOf(step),

  canNavigateTo: (step: StepId) => {
    const status = get().stepStatuses[step];
    return status !== "locked";
  },

  goToStep: (step: StepId) => {
    if (!get().canNavigateTo(step)) return;
    set((state) => ({
      currentStep: step,
      stepStatuses: {
        ...state.stepStatuses,
        [step]: state.stepStatuses[step] === "completed" || state.stepStatuses[step] === "stale"
          ? state.stepStatuses[step]
          : "current",
      },
    }));
  },

  completeStep: (step: StepId) => {
    const idx = STEP_ORDER.indexOf(step);
    const nextStep = STEP_ORDER[idx + 1];
    set((state) => {
      const newStatuses = { ...state.stepStatuses, [step]: "completed" as StepStatus };
      if (nextStep && newStatuses[nextStep] === "locked") {
        newStatuses[nextStep] = "current";
      }
      return {
        stepStatuses: newStatuses,
        currentStep: nextStep || step,
      };
    });
  },

  markStale: (fromStep: StepId) => {
    const idx = STEP_ORDER.indexOf(fromStep);
    set((state) => {
      const newStatuses = { ...state.stepStatuses };
      for (let i = idx + 1; i < STEP_ORDER.length; i++) {
        if (newStatuses[STEP_ORDER[i]] === "completed") {
          newStatuses[STEP_ORDER[i]] = "stale";
        }
      }
      return { stepStatuses: newStatuses };
    });
  },
}));

export { STEP_ORDER, STEP_LABELS };
