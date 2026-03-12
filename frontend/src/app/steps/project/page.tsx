"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepLayout } from "@/components/StepLayout";
import { useProjectStore, type ProjectSpec } from "@/stores/projectStore";
import { usePipelineStore } from "@/stores/pipelineStore";

const ROBOT_TYPES = ["arm", "mobile", "humanoid", "quadruped", "hexapod", "delta", "scara", "custom"];

export default function ProjectPage() {
  const router = useRouter();
  const { projectSpec, setProjectSpec } = useProjectStore();
  const { completeStep, markStale } = usePipelineStore();

  const [form, setForm] = useState<ProjectSpec>(
    projectSpec || {
      project_id: "default",
      robot_name: "",
      robot_type: "arm",
      dof: 6,
      payload_kg: 1.0,
      reach_m: 0.5,
      budget_usd: 1000,
      description: "",
    }
  );

  const update = (field: keyof ProjectSpec, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectSpec(form);

    try {
      await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      // backend may not be running, continue anyway
    }

    if (projectSpec) {
      markStale("project");
    }
    completeStep("project");
    router.push("/steps/structure");
  };

  const inputClass = "w-full bg-black/20 border border-border/40 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/30 transition placeholder:text-muted-foreground/40";

  return (
    <StepLayout stepId="project" title="Project Definition">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-muted-foreground mb-1.5">Robot Name</label>
          <input
            type="text"
            required
            value={form.robot_name}
            onChange={(e) => update("robot_name", e.target.value)}
            className={inputClass}
            placeholder="e.g., MyRobot Arm V1"
          />
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-muted-foreground mb-1.5">Robot Type</label>
          <select
            value={form.robot_type}
            onChange={(e) => update("robot_type", e.target.value)}
            className={inputClass}
          >
            {ROBOT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-muted-foreground mb-1.5">Degrees of Freedom</label>
            <input
              type="number"
              min={1}
              max={30}
              value={form.dof}
              onChange={(e) => update("dof", parseInt(e.target.value) || 1)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-muted-foreground mb-1.5">Payload (kg)</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.payload_kg}
              onChange={(e) => update("payload_kg", parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-muted-foreground mb-1.5">Reach (m)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.reach_m}
              onChange={(e) => update("reach_m", parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-muted-foreground mb-1.5">Budget (USD)</label>
            <input
              type="number"
              min={0}
              step={100}
              value={form.budget_usd}
              onChange={(e) => update("budget_usd", parseFloat(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-muted-foreground mb-1.5">Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Describe the robot's purpose, environment, and any special requirements..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover-glow transition"
        >
          Save & Continue
        </button>
      </form>
    </StepLayout>
  );
}
