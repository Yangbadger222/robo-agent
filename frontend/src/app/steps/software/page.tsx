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
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={options[key as keyof typeof options]}
                onChange={(e) => setOptions((o) => ({ ...o, [key]: e.target.checked }))}
                className="rounded"
              />
              {label}
            </label>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isStreaming}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 disabled:opacity-50 transition"
        >
          <Code className="w-4 h-4" />
          Generate Software with AI
        </button>

        {fileCount > 0 && (
          <div className="flex rounded-lg border border-border overflow-hidden" style={{ height: "400px" }}>
            <div className="w-48 border-r border-border overflow-y-auto bg-card">
              <FileTree
                files={generatedCode}
                selectedFile={selectedFile}
                onSelect={setSelectedFile}
              />
            </div>
            <div className="flex-1">
              {selectedFile && generatedCode[selectedFile] ? (
                <CodeViewer
                  code={generatedCode[selectedFile]}
                  language={
                    selectedFile.endsWith(".py") ? "python" :
                    selectedFile.endsWith(".json") ? "json" :
                    selectedFile.endsWith(".yaml") || selectedFile.endsWith(".yml") ? "yaml" :
                    "xml"
                  }
                  height="400px"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Select a file to view
                </div>
              )}
            </div>
          </div>
        )}

        {fileCount > 0 && (
          <button
            onClick={handleComplete}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-700 transition"
          >
            Confirm Software & Continue
          </button>
        )}
      </div>
    </StepLayout>
  );
}
