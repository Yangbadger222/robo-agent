"use client";

import { ReactNode } from "react";
import { StepChatPanel } from "./StepChatPanel";
import { StaleWarning } from "./StaleWarning";
import { StepNavButtons } from "./StepNavButtons";
import type { StepId } from "@/stores/pipelineStore";

interface StepLayoutProps {
  stepId: StepId;
  title: string;
  children: ReactNode;
  onRerun?: () => void;
}

export function StepLayout({ stepId, title, children, onRerun }: StepLayoutProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      <StaleWarning stepId={stepId} />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-border/40 overflow-y-auto glass-card">
          <div className="p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-[10px] tracking-widest uppercase text-neon-cyan/60">// step</span>
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            </div>
            {children}
            <div className="mt-8">
              <StepNavButtons stepId={stepId} onRerun={onRerun} />
            </div>
          </div>
        </div>
        <div className="w-1/2 flex flex-col bg-background/50">
          <StepChatPanel stepId={stepId} />
        </div>
      </div>
    </div>
  );
}
