"use client";

import { StepLayout } from "@/components/StepLayout";
import { CodeViewer } from "@/components/CodeViewer";
import { useStructureStore } from "@/stores/structureStore";
import { usePipelineStore } from "@/stores/pipelineStore";
import { useSSE } from "@/hooks/useSSE";
import { useProjectStore } from "@/stores/projectStore";
import { useChatStore } from "@/stores/chatStore";
import { Wand2 } from "lucide-react";

export default function StructurePage() {
  const { urdfCode, structureSpec, setUrdfCode } = useStructureStore();
  const { completeStep, markStale } = usePipelineStore();
  const project = useProjectStore((s) => s.projectSpec);
  const { isStreaming } = useChatStore();
  const { runStep } = useSSE("structure");

  const handleGenerate = () => {
    if (!project) return;
    runStep(
      `Generate a URDF for a ${project.robot_type} robot named "${project.robot_name}" with ${project.dof} DOF, ` +
      `${project.payload_kg}kg payload, and ${project.reach_m}m reach. ${project.description}`
    );
  };

  const handleComplete = () => {
    if (urdfCode) {
      markStale("structure");
      completeStep("structure");
    }
  };

  return (
    <StepLayout stepId="structure" title="Structure Design (URDF)" onRerun={handleGenerate}>
      <div className="space-y-4">
        <button
          onClick={handleGenerate}
          disabled={!project || isStreaming}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-50 transition"
        >
          <Wand2 className="w-4 h-4" />
          Generate URDF with AI
        </button>

        {urdfCode && (
          <>
            <CodeViewer
              code={urdfCode}
              language="xml"
              onChange={(val) => setUrdfCode(val)}
              readOnly={false}
              height="350px"
            />

            {structureSpec && (
              <div className="rounded-lg border border-border p-4 text-sm space-y-2">
                <h4 className="font-medium">Parsed Structure</h4>
                <p className="text-muted-foreground">
                  {structureSpec.links?.length || 0} links, {structureSpec.joints?.length || 0} joints
                </p>
                {structureSpec.joints?.map((j) => (
                  <div key={j.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{j.name}</span>
                    <span>({j.type})</span>
                    <span>{j.parent} → {j.child}</span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleComplete}
              className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition"
            >
              Confirm Structure & Continue
            </button>
          </>
        )}
      </div>
    </StepLayout>
  );
}
