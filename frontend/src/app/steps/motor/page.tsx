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
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-50 transition"
        >
          <Search className="w-4 h-4" />
          Find Motors with AI
        </button>

        {motorSelections.length > 0 && (
          <>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Joint</th>
                    <th className="px-3 py-2 text-left font-medium">Motor</th>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-right font-medium">Torque (Nm)</th>
                    <th className="px-3 py-2 text-right font-medium">Price ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {motorSelections.map((m, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2 font-mono text-xs">{m.joint_name}</td>
                      <td className="px-3 py-2">{m.recommended_motor}</td>
                      <td className="px-3 py-2 text-muted-foreground">{m.motor_type}</td>
                      <td className="px-3 py-2 text-right">{m.torque_nm}</td>
                      <td className="px-3 py-2 text-right">${m.estimated_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition"
            >
              Confirm Motors & Continue
            </button>
          </>
        )}
      </div>
    </StepLayout>
  );
}
