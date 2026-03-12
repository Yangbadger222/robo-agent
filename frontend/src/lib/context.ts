import { useProjectStore } from "@/stores/projectStore";
import { useStructureStore } from "@/stores/structureStore";
import { useMotorStore } from "@/stores/motorStore";
import { useHardwareStore } from "@/stores/hardwareStore";
import { useSoftwareStore } from "@/stores/softwareStore";

export interface StepContext {
  project_spec: Record<string, unknown>;
  structure_spec: Record<string, unknown>;
  motor_selections: Record<string, unknown>[];
  hardware_bom: Record<string, unknown>[];
  generated_code: Record<string, string>;
}

export function buildStepContext(step: string): StepContext {
  const project = useProjectStore.getState().projectSpec;
  const structure = useStructureStore.getState();
  const motors = useMotorStore.getState().motorSelections;
  const hardware = useHardwareStore.getState().hardwareBom;
  const software = useSoftwareStore.getState().generatedCode;

  const ctx: StepContext = {
    project_spec: project || {},
    structure_spec: {},
    motor_selections: [],
    hardware_bom: [],
    generated_code: {},
  };

  if (["structure", "motor", "hardware", "software", "review"].includes(step)) {
    ctx.structure_spec = structure.structureSpec || {};
    ctx.generated_code = { ...ctx.generated_code, ...(structure.urdfCode ? { "robot.urdf": structure.urdfCode } : {}) };
  }

  if (["motor", "hardware", "software", "review"].includes(step)) {
    ctx.motor_selections = motors || [];
  }

  if (["hardware", "software", "review"].includes(step)) {
    ctx.hardware_bom = hardware || [];
  }

  if (["software", "review"].includes(step)) {
    ctx.generated_code = { ...ctx.generated_code, ...software };
  }

  return ctx;
}
