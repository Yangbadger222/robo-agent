"use client";

import { useRouter } from "next/navigation";
import { usePipelineStore, STEP_ORDER, STEP_LABELS, type StepId, type StepStatus } from "@/stores/pipelineStore";
import { cn } from "@/lib/utils";
import { Check, Circle, AlertTriangle, Lock } from "lucide-react";

const statusConfig: Record<StepStatus, { icon: React.ElementType; color: string; bg: string }> = {
  completed: { icon: Check, color: "text-neon-green", bg: "bg-neon-green/10 border-neon-green/40" },
  current: { icon: Circle, color: "text-neon-cyan", bg: "bg-neon-cyan/10 border-neon-cyan/40" },
  stale: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/40" },
  locked: { icon: Lock, color: "text-muted-foreground/60", bg: "bg-muted/30 border-border/40" },
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
    <nav className="flex items-center gap-2 px-6 py-4 bg-card/80 backdrop-blur-md border-b border-border/60 overflow-x-auto relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
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
                    ? "neon-line-completed"
                    : "bg-border/40"
                )}
              />
            )}
            <button
              onClick={() => handleClick(step)}
              disabled={!canNavigateTo(step)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                config.bg,
                isActive && "glow-border ring-1 ring-neon-cyan/30",
                canNavigateTo(step) ? "cursor-pointer hover:brightness-125 hover-glow" : "cursor-not-allowed opacity-50"
              )}
            >
              <Icon className={cn("w-4 h-4", config.color)} />
              <span className={cn(
                "font-mono text-xs tracking-wide",
                isActive ? "text-foreground text-glow" : "text-muted-foreground"
              )}>
                {STEP_LABELS[step]}
              </span>
            </button>
          </div>
        );
      })}
    </nav>
  );
}
