"use client";

import { useRouter } from "next/navigation";
import { usePipelineStore, STEP_ORDER, STEP_LABELS, type StepId, type StepStatus } from "@/stores/pipelineStore";
import { cn } from "@/lib/utils";
import { Check, Circle, AlertTriangle, Lock } from "lucide-react";

const statusConfig: Record<StepStatus, { icon: React.ElementType; color: string; bg: string }> = {
  completed: { icon: Check, color: "text-green-400", bg: "bg-green-500/20 border-green-500/50" },
  current: { icon: Circle, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/50" },
  stale: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/50" },
  locked: { icon: Lock, color: "text-zinc-500", bg: "bg-zinc-800 border-zinc-700" },
};

export function StepperBar() {
  const router = useRouter();
  const { stepStatuses, currentStep, goToStep, canNavigateTo } = usePipelineStore();

  const handleClick = (step: StepId) => {
    if (!canNavigateTo(step)) return;
    goToStep(step);
    router.push(`/steps/${step}`);
  };

  return (
    <nav className="flex items-center gap-2 px-6 py-4 bg-card border-b border-border overflow-x-auto">
      {STEP_ORDER.map((step, idx) => {
        const status = stepStatuses[step];
        const config = statusConfig[status];
        const Icon = config.icon;
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex items-center">
            {idx > 0 && (
              <div
                className={cn(
                  "w-8 h-px mx-1",
                  stepStatuses[STEP_ORDER[idx - 1]] === "completed"
                    ? "bg-green-500/50"
                    : "bg-zinc-700"
                )}
              />
            )}
            <button
              onClick={() => handleClick(step)}
              disabled={!canNavigateTo(step)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                config.bg,
                isActive && "ring-2 ring-blue-500/50",
                canNavigateTo(step) ? "cursor-pointer hover:brightness-110" : "cursor-not-allowed opacity-60"
              )}
            >
              <Icon className={cn("w-4 h-4", config.color)} />
              <span className={cn(isActive ? "text-foreground" : "text-muted-foreground")}>
                {STEP_LABELS[step]}
              </span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
