"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";
import { useSSE } from "@/hooks/useSSE";
import type { StepId } from "@/stores/pipelineStore";
import { cn } from "@/lib/utils";

interface StepChatPanelProps {
  stepId: StepId;
}

export function StepChatPanel({ stepId }: StepChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getMessages, isStreaming, streamingContent } = useChatStore();
  const { sendMessage } = useSSE(stepId);
  const messages = getMessages(stepId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-background/30">
      <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
        <span className={cn(
          "status-dot",
          isStreaming ? "bg-neon-cyan animate-glow-pulse" : "bg-neon-green"
        )} />
        <h3 className="text-xs font-mono tracking-wider uppercase text-muted-foreground">
          AI Terminal
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isStreaming && (
          <div className="text-center text-muted-foreground text-sm mt-8 font-mono">
            <span className="text-neon-cyan/40">&gt;</span> Ask the AI to help with this step, or click a button on the left to auto-generate.
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-lg px-4 py-3 text-sm animate-fade-in-up",
              msg.role === "user"
                ? "bg-neon-cyan/5 border-l-2 border-neon-cyan/40 ml-8"
                : "bg-muted/40 border-l-2 border-muted-foreground/20 mr-8"
            )}
          >
            {msg.role === "assistant" ? (
              <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
                {msg.content}
              </ReactMarkdown>
            ) : (
              <p className="font-mono text-sm">{msg.content}</p>
            )}
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="bg-muted/40 border-l-2 border-neon-cyan/30 rounded-lg px-4 py-3 text-sm mr-8">
            <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
              {streamingContent}
            </ReactMarkdown>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex items-center gap-1.5 text-neon-cyan text-sm font-mono pl-1">
            <span className="animate-dot-pulse" style={{ animationDelay: "0ms" }}>.</span>
            <span className="animate-dot-pulse" style={{ animationDelay: "200ms" }}>.</span>
            <span className="animate-dot-pulse" style={{ animationDelay: "400ms" }}>.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="$ type a command..."
            disabled={isStreaming}
            className="flex-1 bg-black/30 border border-border/40 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/30 placeholder:text-muted-foreground/50 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover-glow disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
