"use client";

import { AlertTriangle } from "lucide-react";
import { usePipelineStore, type StepId } from "@/stores/pipelineStore";

interface StaleWarningProps {
  stepId: StepId;
}

export function StaleWarning({ stepId }: StaleWarningProps) {
  const status = usePipelineStore((s) => s.stepStatuses[stepId]);

  if (status !== "stale") return null;

  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-sm">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>Upstream inputs have changed. Re-run this step to update results.</span>
    </div>
  );
}
