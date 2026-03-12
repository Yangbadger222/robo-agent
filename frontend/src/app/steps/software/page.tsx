"use client";

import { useState } from "react";
import { StepLayout } from "@/components/StepLayout";
import { CodeViewer } from "@/components/CodeViewer";
import { FileTree } from "@/components/FileTree";
import { useSoftwareStore } from "@/stores/softwareStore";
import { usePipelineStore } from "@/stores/pipelineStore";
import { useSSE } from "@/hooks/useSSE";
import { useChatStore } from "@/stores/chatStore";
import { Code } from "lucide-react";

export default function SoftwarePage() {
  const { generatedCode } = useSoftwareStore();
  const { completeStep } = usePipelineStore();
  const { isStreaming } = useChatStore();
  const { runStep } = useSSE("software");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const [options, setOptions] = useState({
    ros2_nodes: true,
    isaac_lab: true,
    launch_files: true,
  });

  const handleGenerate = () => {
    const parts = [];
    if (options.ros2_nodes) parts.push("ROS 2 nodes (publisher, subscriber, service)");
    if (options.isaac_lab) parts.push("Isaac Lab RL environment");
    if (options.launch_files) parts.push("launch files");
    runStep(`Generate the following software: ${parts.join(", ")}. Use all upstream context.`);
  };

  const handleComplete = () => {
    if (Object.keys(generatedCode).length > 0) {
      completeStep("software");
    }
  };

  const fileCount = Object.keys(generatedCode).length;

  return (
    <StepLayout stepId="software" title="Upper-Level Software" onRerun={handleGenerate}>
      <div className="space-y-4">
        <div className="space-y-2">
          {[
            { key: "ros2_nodes", label: "ROS 2 Nodes" },
            { key: "isaac_lab", label: "Isaac Lab RL Environment" },
            { key: "launch_files", label: "Launch Files" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm font-mono cursor-pointer group">
              <input
                type="checkbox"
                checked={options[key as keyof typeof options]}
                onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))}
                className="rounded accent-neon-cyan"
              />
              <span className="group-hover:text-neon-cyan/80 transition">{label}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isStreaming}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover-glow disabled:opacity-50 transition"
        >
          <Code className="w-4 h-4" />
          Generate Software with AI
        </button>

        {fileCount > 0 && (
          <div className="flex rounded-lg glass-card overflow-hidden corner-brackets" style={{ height: "400px" }}>
            <div className="w-48 flex-shrink-0 border-r border-border/30 overflow-y-auto bg-black/20">
              <FileTree
                files={generatedCode}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
              />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              {selectedFile && generatedCode[selectedFile] ? (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-3 py-1.5 bg-black/30 border-b border-border/30 text-xs">
                    <span className="font-mono truncate text-neon-cyan/70">{selectedFile}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-2 text-muted-foreground hover:text-neon-cyan transition flex-shrink-0"
                      aria-label="Close file"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 min-h-0">
                    <CodeViewer
                      code={generatedCode[selectedFile]}
                      language={
                        selectedFile.endsWith(".py") ? "python" :
                        selectedFile.endsWith(".json") ? "json" :
                        selectedFile.endsWith(".yaml") || selectedFile.endsWith(".yml") ? "yaml" :
                        "xml"
                      }
                      height="100%"
                      noBorder
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground font-mono">
                  <span className="text-neon-cyan/30">&gt;</span>&nbsp;Select a file to view
                </div>
              )}
            </div>
          </div>
        )}

        {fileCount > 0 && (
          <button
            onClick={handleComplete}
            className="w-full bg-neon-green/90 text-black rounded-lg py-2.5 text-sm font-medium hover:bg-neon-green hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition"
          >
            Confirm Software & Continue
          </button>
        )}
      </div>
    </StepLayout>
  );
}
