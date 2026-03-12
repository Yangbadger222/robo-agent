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
        <div className="w-1/2 border-r border-border overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">{title}</h2>
            {children}
            <div className="mt-8">
              <StepNavButtons stepId={stepId} onRerun={onRerun} />
            </div>
          </div>
        </div>
        <div className="w-1/2 flex flex-col">
          <StepChatPanel stepId={stepId} />
        </div>
      </div>
    </div>
  );
}
