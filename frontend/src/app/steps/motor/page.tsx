"use client";

import { StepLayout } from "@/components/StepLayout";
import { useMotorStore } from "@/stores/motorStore";
import { useStructureStore } from "@/stores/structureStore";
import { usePipelineStore } from "@/stores/pipelineStore";
import { useSSE } from "@/hooks/useSSE";
import { useChatStore } from "@/stores/chatStore";
import { Search } from "lucide-react";

export default function MotorPage() {
  const { motorSelections } = useMotorStore();
  const structureSpec = useStructureStore((s) => s.structureSpec);
  const { completeStep, markStale } = usePipelineStore();
  const { isStreaming } = useChatStore();
  const { runStep } = useSSE("motor");

  const handleFind = () => {
    if (!structureSpec) return;
    const jointNames = structureSpec.joints?.map((j) => j.name).join(", ") || "unknown joints";
    runStep(`Find suitable motors for these joints: ${jointNames}. Consider the project requirements.`);
  };

  const handleComplete = () => {
    if (motorSelections.length > 0) {
      markStale("motor");
      completeStep("motor");
    }
  };

  return (
    <StepLayout stepId="motor" title="Motor & Actuator Selection" onRerun={handleFind}>
      <div className="space-y-4">
        <button
          onClick={handleFind}
          disabled={!structureSpec || isStreaming}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover-glow disabled:opacity-50 transition"
        >
          <Search className="w-4 h-4" />
          Find Motors with AI
        </button>

        {motorSelections.length > 0 && (
          <>
            <div className="rounded-lg glass-card overflow-hidden corner-brackets">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neon-cyan/20">
                    <th className="px-3 py-2.5 text-left font-mono text-[10px] tracking-wider uppercase text-neon-cyan/60">Joint</th>
                    <th className="px-3 py-2.5 text-left font-mono text-[10px] tracking-wider uppercase text-neon-cyan/60">Motor</th>
                    <th className="px-3 py-2.5 text-left font-mono text-[10px] tracking-wider uppercase text-neon-cyan/60">Type</th>
                    <th className="px-3 py-2.5 text-right font-mono text-[10px] tracking-wider uppercase text-neon-cyan/60">Torque (Nm)</th>
                    <th className="px-3 py-2.5 text-right font-mono text-[10px] tracking-wider uppercase text-neon-cyan/60">Price ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {motorSelections.map((m, i) => (
                    <tr key={i} className="border-t border-border/30 hover:bg-neon-cyan/5 transition">
                      <td className="px-3 py-2 font-mono text-xs text-neon-cyan/80">{m.joint_name}</td>
                      <td className="px-3 py-2">{m.recommended_motor}</td>
                      <td className="px-3 py-2 text-muted-foreground">{m.motor_type}</td>
                      <td className="px-3 py-2 text-right font-mono">{m.torque_nm ?? "—"}</td>
                      <td className="px-3 py-2 text-right font-mono">${m.estimated_price ?? "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-neon-green/90 text-black rounded-lg py-2.5 text-sm font-medium hover:bg-neon-green hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition"
            >
              Confirm Motors & Continue
            </button>
          </>
        )}
      </div>
    </StepLayout>
  );
}
