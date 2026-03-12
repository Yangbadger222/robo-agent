"use client";

import { useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useStructureStore } from "@/stores/structureStore";
import { useMotorStore } from "@/stores/motorStore";
import { useHardwareStore } from "@/stores/hardwareStore";
import { useSoftwareStore } from "@/stores/softwareStore";
import { buildStepContext } from "@/lib/context";
import type { StepId } from "@/stores/pipelineStore";

function applyResult(stepId: StepId, result: Record<string, unknown>) {
  if (result.urdf_code && typeof result.urdf_code === "string") {
    useStructureStore.getState().setUrdfCode(result.urdf_code);
  }
  if (result.structure_spec && typeof result.structure_spec === "object") {
    useStructureStore.getState().setStructureSpec(result.structure_spec as any);
  }
  if (Array.isArray(result.motor_selections) && result.motor_selections.length > 0) {
    useMotorStore.getState().setMotorSelections(result.motor_selections as any);
  }
  if (Array.isArray(result.hardware_bom) && result.hardware_bom.length > 0) {
    useHardwareStore.getState().setHardwareBom(result.hardware_bom as any);
  }
  if (result.generated_code && typeof result.generated_code === "object") {
    const code = result.generated_code as Record<string, string>;
    if (Object.keys(code).length > 0) {
      const existing = useSoftwareStore.getState().generatedCode;
      useSoftwareStore.getState().setGeneratedCode({ ...existing, ...code });
    }
  }
}

export function useSSE(stepId: StepId) {
  const { addMessage, appendStreamingContent, setIsStreaming, clearStreaming } = useChatStore();

  const sendMessage = useCallback(
    async (userMessage: string) => {
      addMessage(stepId, { role: "user", content: userMessage });
      clearStreaming();
      setIsStreaming(true);

      const context = buildStepContext(stepId);
      const messages = useChatStore.getState().getMessages(stepId);

      try {
        const response = await fetch(`/api/step/${stepId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            ...context,
          }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let fullContent = "";
        let streamDone = false;
        let currentEvent = "";

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
              if (currentEvent === "done") {
                streamDone = true;
                break;
              }
              continue;
            }

            if (line.startsWith("data: ") && currentEvent) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);

                if (currentEvent === "token" && parsed.content) {
                  fullContent += parsed.content;
                  appendStreamingContent(parsed.content);
                } else if (currentEvent === "result") {
                  applyResult(stepId, parsed);
                } else if (currentEvent === "error" && parsed.error) {
                  fullContent += `\n\n**Error:** ${parsed.error}`;
                  appendStreamingContent(`\n\n**Error:** ${parsed.error}`);
                }
              } catch {
                // non-JSON data line
              }
              currentEvent = "";
            }
          }
        }

        if (fullContent) {
          addMessage(stepId, { role: "assistant", content: fullContent });
        }
      } catch (error) {
        addMessage(stepId, {
          role: "assistant",
          content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      } finally {
        clearStreaming();
        setIsStreaming(false);
      }
    },
    [stepId, addMessage, appendStreamingContent, setIsStreaming, clearStreaming]
  );

  const runStep = useCallback(
    (prompt: string) => sendMessage(prompt),
    [sendMessage]
  );

  return { sendMessage, runStep };
}
