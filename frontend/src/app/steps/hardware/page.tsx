"use client";

import { StepLayout } from "@/components/StepLayout";
import { useHardwareStore } from "@/stores/hardwareStore";
import { usePipelineStore } from "@/stores/pipelineStore";
import { useSSE } from "@/hooks/useSSE";
import { useChatStore } from "@/stores/chatStore";
import { Cpu } from "lucide-react";

const CATEGORIES = ["mcu", "driver", "sensor", "comms", "power"];
const CATEGORY_LABELS: Record<string, string> = {
  mcu: "Microcontroller / Controller",
  driver: "Motor Drivers",
  sensor: "Sensors",
  comms: "Communication",
  power: "Power Supply",
};

export default function HardwarePage() {
  const { hardwareBom } = useHardwareStore();
  const { completeStep, markStale } = usePipelineStore();
  const { isStreaming } = useChatStore();
  const { runStep } = useSSE("hardware");

  const handleRecommend = () => {
    runStep("Recommend all hardware components (MCU, drivers, sensors, communication, power) for this robot.");
  };

  const handleComplete = () => {
    if (hardwareBom.length > 0) {
      markStale("hardware");
      completeStep("hardware");
    }
  };

  return (
    <StepLayout stepId="hardware" title="Lower-Level Hardware" onRerun={handleRecommend}>
      <div className="space-y-4">
        <button
          onClick={handleRecommend}
          disabled={isStreaming}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover-glow disabled:opacity-50 transition"
        >
          <Cpu className="w-4 h-4" />
          Recommend Hardware with AI
        </button>

        {CATEGORIES.map((cat) => {
          const items = hardwareBom.filter((h) => h.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="rounded-lg glass-card p-4 space-y-3 corner-brackets">
              <h4 className="font-mono text-xs tracking-wider uppercase text-neon-cyan/60">{CATEGORY_LABELS[cat]}</h4>
              {items.map((item, i) => (
                <div key={i} className="flex items-start justify-between text-sm border-l-2 border-neon-cyan/20 pl-3">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.manufacturer} — {item.mpn}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                  </div>
                  <span className="text-sm font-mono text-neon-cyan/80">${item.estimated_price ?? "N/A"}</span>
                </div>
              ))}
            </div>
          );
        })}

        {hardwareBom.length > 0 && (
          <button
            onClick={handleComplete}
            className="w-full bg-neon-green/90 text-black rounded-lg py-2.5 text-sm font-medium hover:bg-neon-green hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition"
          >
            Confirm Hardware & Continue
          </button>
        )}
      </div>
    </StepLayout>
  );
}
