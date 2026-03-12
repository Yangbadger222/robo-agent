"use client";

import { useRouter } from "next/navigation";
import { usePipelineStore, STEP_ORDER, type StepId } from "@/stores/pipelineStore";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

interface StepNavButtonsProps {
  stepId: StepId;
  onRerun?: () => void;
}

export function StepNavButtons({ stepId, onRerun }: StepNavButtonsProps) {
  const router = useRouter();
  const { stepStatuses, goToStep } = usePipelineStore();
  const idx = STEP_ORDER.indexOf(stepId);
  const prevStep = idx > 0 ? STEP_ORDER[idx - 1] : null;
  const nextStep = idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : null;
  const status = stepStatuses[stepId];
  const canGoNext = nextStep && (status === "completed" || stepStatuses[nextStep] !== "locked");

  const navigate = (step: StepId) => {
    goToStep(step);
    router.push(`/steps/${step}`);
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        {prevStep && (
          <button
            onClick={() => navigate(prevStep)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-neon-cyan/30 hover:glow-border-sm transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {status === "stale" && onRerun && (
          <button
            onClick={onRerun}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-amber-500/40 text-amber-400 text-sm hover:bg-amber-500/10 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)] transition"
          >
            <RefreshCw className="w-4 h-4" />
            Re-run
          </button>
        )}
        {canGoNext && (
          <button
            onClick={() => navigate(nextStep!)}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover-glow transition"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
